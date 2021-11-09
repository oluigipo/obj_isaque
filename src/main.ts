import { Client, Message, GuildMember, TextChannel, Guild, Role, ChannelLogsQueryOptions, User } from "discord.js";
import {
	Server, Command, devs, Arguments, charCodeOf, Argument, ArgumentKind,
	parseTime, discordErrorHandler, Permission, Channels, defaultErrorHandler,
	notNull, validatePermissions, Roles, Emojis, emptyEmbed, defaultEmbed, cursedInvites, formatTime, dateOf, Time
} from "./defs";
import * as Moderation from "./moderation";
import * as Database from "./database";
import * as Balance from "./balance";
import * as Giveaway from "./giveaway";
import * as fs from "fs";
import commands from "./commands";
import https from "https";

const auth = JSON.parse(fs.readFileSync("auth.json", "utf8"));
Server.specialInvite = auth.invite;
const client = new Client();
type Invite = { code: string, uses: number, author: User | null; };
type Invites = { [key: string]: Invite };
let invites: Invites = {};

const timeout = <{ [key: string]: number }>{};

function parseArgs(raw: string[], msg: Message): Arguments {
	const result = <Arguments>[];

	for (let str of raw) {
		let arg = <Argument>{};

		// if everything below fails, it's a string
		arg.kind = ArgumentKind.STRING;
		arg.value = str;

		result.push(arg);

		// parse as member or channel
		if (str[0] === '<') {
			str = str.substr(1);
			if (str[0] === '@') {
				let isRole = false;
				if (str.startsWith("@&")) {
					str = str.substr(2);
					isRole = true;
				} else {
					str = str.substr((str[1] === '!') ? 2 : 1);
				}

				const id = str.substr(0, 18);

				if (msg.guild === null) continue;
				if (isRole) {
					const role = msg.guild.roles.cache.get(id);
					if (role === undefined) continue;

					arg.kind = ArgumentKind.ROLE;
					arg.value = role;
				} else {
					const member = msg.guild.members.cache.get(id);

					if (member === undefined) {
						arg.kind = ArgumentKind.USERID;
						arg.value = id;
					} else {
						arg.kind = ArgumentKind.MEMBER;
						arg.value = member;
					}
				}
			} else if (str[0] === '#') {
				str = str.substr(1);

				const id = str.substr(0, 18);

				if (msg.guild === null) continue;
				const channel = msg.guild.channels.cache.get(id);

				if (channel === undefined) continue;
				arg.kind = ArgumentKind.CHANNEL;
				arg.value = channel;
			} else if (str[0] === ':' || str.startsWith("a:")) {
				const last = str.indexOf(':', 2);
				const id = str.substr(last + 1, 18);

				const emoji = client.emojis.cache.get(id);
				if (emoji === undefined) continue;
				arg.kind = ArgumentKind.EMOJI;
				arg.value = emoji;
			}

			continue;
		}

		let code = str.charCodeAt(0);

		// parse as number or time
		if (code >= charCodeOf('0') && code <= charCodeOf('9')) {

			// 18 chars, check if it's an ID
			if (str.length == 18) {
				let isntId = false;

				for (let i = 1; i < str.length; ++i) {
					const code = str.charCodeAt(i);

					if (code < charCodeOf('0') || code > charCodeOf('9')) {
						isntId = true;
						break;
					}
				}

				if (!isntId) {
					arg.kind = ArgumentKind.USERID;
					arg.value = str;
					continue;
				}
			}

			const v = parseFloat(str);

			// parse as time if the length doesn't match
			if (String(v).length !== str.length) {
				const result = parseTime(str);

				if (result.success) {
					arg.kind = ArgumentKind.TIME;
					arg.value = result.data;
				}
			} else {
				arg.kind = ArgumentKind.NUMBER;
				arg.value = v;
			}
		}
	}

	return result;
}

function predictResponse(msg: Message) {
	if (msg.content.toLowerCase().includes("sentido da vida")) {
		msg.channel.send(`${msg.author} é simples: 42`).catch(defaultErrorHandler);
		return true;
	}

	return false;
}

async function fetchInvites(guild?: Guild) {
	const inv = await (guild ?? client.guilds.cache.get(Server.id))?.fetchInvites()
	if (inv) {
		const invites: Invites = {};
		inv.forEach((value) => invites[value.code] = { code: value.code, uses: value.uses ?? 0, author: value.inviter });
		return invites;
	}

	return undefined;
}

client.on("inviteCreate", invite => {
	invites[invite.code] = { code: invite.code, uses: invite.uses ?? 0, author: invite.inviter };
});

client.on("ready", async () => {
	try {
		await Database.init(auth.mongoURI, auth.mongo);
		await Moderation.init(client);
		await Balance.init(client);
		await Giveaway.init(client);
	} catch (err) {
		defaultErrorHandler(err);
	}

	try {
		// @NOTE(luigi): what?
		invites = (await fetchInvites()) ?? {};

		notNull(client.user).setPresence({ activity: { name: "o curso do NoNe!", type: "WATCHING" }, status: "online" });

		const guild = client.guilds.cache.get(Server.id);
		if (!guild)
			return;

		// Fetching messages
		(<TextChannel>guild.channels.cache.get(Channels.rules)).messages.fetch();

		// log de punições
		let channel = guild.channels.cache.get(Channels.log);
		if (!channel || channel.type !== "text")
			return;

		Channels.logObject = <TextChannel>channel;

		// join log
		channel = guild.channels.cache.get(Channels.joinLog);
		if (!channel || channel.type !== "text")
			return;

		Channels.joinLogObject = <TextChannel>channel;
	} catch (err) {
		discordErrorHandler(err);
	}

	console.log("Online!");
});

client.on("messageReactionAdd", async (reaction, user) => {
	if (reaction.message.guild?.id !== Server.id || user.id === client.user?.id)
		return;

	const member = await reaction.message.guild?.members.fetch(user.id);
	if (!member)
		return;

	switch (reaction.message.id) {
		case Server.rolepickMsg:
			if (reaction.emoji.id === Emojis.unity) // unity
				member.roles.add(Roles.unity).catch(discordErrorHandler);
			else if (reaction.emoji.id === Emojis.gamemaker) // game maker
				member.roles.add(Roles.gamemaker).catch(discordErrorHandler);
			break;

		case Server.communityRolepickMsg:
			if (reaction.emoji.id === Emojis.capitao)
				member.roles.add(Roles.community).catch(discordErrorHandler);
			break;
	}
});

client.on("error", discordErrorHandler);

client.on("messageReactionRemove", async (reaction, user) => {
	if (reaction.message.guild?.id !== Server.id)
		return;

	const member = await reaction.message.guild?.members.fetch(user.id);
	if (!member)
		return;

	switch (reaction.message.id) {
		case Server.rolepickMsg:
			if (reaction.emoji.id === Emojis.unity) // unity
				member.roles.remove(Roles.unity).catch(discordErrorHandler);
			else if (reaction.emoji.id === Emojis.gamemaker) // game maker
				member.roles.remove(Roles.gamemaker).catch(discordErrorHandler);
			break;

		// case Server.communityRolepickMsg:
		// 	if (reaction.emoji.id === Emojis.capitao)
		// 		member.roles.remove(Roles.community).catch(discordErrorHandler);
		// 	break;
	}
});

client.on("guildMemberAdd", async member => {
	if (member.guild.id !== Server.id) return;
	if (Moderation.isMuted(member.id))
		member.roles.add(Roles.muted).catch(discordErrorHandler);

	const newInvites = (<Invites>await fetchInvites().catch(discordErrorHandler));

	let invite: Invite | undefined;
	if (newInvites[Server.specialInvite].uses > invites[Server.specialInvite].uses) {
		member.roles.add(Roles.aluno).catch(discordErrorHandler);

		invite = newInvites[Server.specialInvite];
	} else {
		const keys = Object.keys(invites);
		for (const key of keys) {
			if (newInvites[key] && invites[key].uses < newInvites[key].uses) {
				invite = newInvites[key];
				break;
			}
		}
	}

	let banned = false;
	if (cursedInvites.includes(invite?.code ?? "")) {
		banned = true;
		member.ban({ reason: "Cursed invite: " + invite });
		Channels.logObject.send(emptyEmbed().setDescription(`SINTA O PODER DO MARTELO! SEU CONVITE O AMALDIÇOOU! ${member}`));
	}

	invites = newInvites;

	const embed = defaultEmbed(member);

	embed.title = "Member Joined";
	embed.description = "";
	if (banned)
		embed.description += "[Cursed Invite] ";

	embed.description += member.toString();
	embed.addField("ID", member.id, true);

	let age = "Desconhecido (é null, fazer o quê)";
	if (member.user?.createdTimestamp) {
		age = dateOf(member.user.createdTimestamp);

		const accountAge = Date.now() - member.user.createdTimestamp;
		if (accountAge < Time.week * 2)
			embed.addField("Account Age (new account)", formatTime(accountAge));
	}

	embed.addField("Creation Date", age, true);

	embed.addField("Invite", invite?.code ?? "noneclass", true);

	embed.addField("Invite Author", invite?.author?.toString() ?? "Desconhecido");

	const user = member.user;
	if (user)
		embed.addField("Username", user.tag, true);

	Channels.joinLogObject.send(embed).catch(discordErrorHandler);
});

client.on("guildMemberRemove", member => {
	const embed = defaultEmbed(member);

	embed.color = 0xff3333;
	embed.title = "Member Left";
	embed.description = member.toString();
	embed.addField("ID", member.id, true);
	if (member.user)
		embed.addField("Username", member.user.tag, true);

	if (member.roles.cache.size > 0) {
		embed.addField("Roles", member.roles.cache.array().join(' '));
	}

	Channels.joinLogObject.send(embed).catch(discordErrorHandler);
});

client.on("voiceStateUpdate", (state0, state1) => {
	if (!state1.channelID) return;
	if (state1.channelID === state0.channelID) return;

	if (!state1.member || state1.guild.id !== Server.id)
		return;

	if (Moderation.isMuted(state1.member.id)) {
		if (!state1.mute) state1.setMute(true).catch(discordErrorHandler);
	} else {
		if (state1.mute) state1.setMute(false).catch(discordErrorHandler);
	}
});

client.on("message", (message) => {
	if (message.author.bot || message.channel.type === "dm" || message.guild === null)
		return;

	// let req = https.get(`https://discord.com/api/v8/channels/${message.channel.id}/messages/${message.id}`, {
	// 	headers: {
	// 		'Authorization': `Bot ${auth.token}`
	// 	}
	// }, (res) => {
	// 	let chunks: Uint8Array[] = [];

	// 	res.on("data", (chunk) => {
	// 		chunks.push(chunk);
	// 	});

	// 	res.on("end", (chunk: any) => {
	// 		var body = Buffer.concat(chunks);
	// 		let data = JSON.parse(body.toString())
	// 		if (data.stickers) {
	// 			message.delete()
	// 		}
	// 	});

	// 	res.on("error", (error) => {
	// 		console.error(error);
	// 	});
	// });

	// req.end();

	if (message.content.length < 1)
		return;

	if (message.content.includes("@everyone") && !message.mentions.everyone && message.member) {
		message.delete();

		if (!Moderation.isMuted(message.member.id)) {
			console.log("detectei uma conta comprometida!");

			let r = Moderation.mute(message.member.id, Time.day, "possivelmente conta hackeada", message.member);

			if (r.success) {
				message.channel.send(`usuário ${message.author} mutado: conta possivelmente comprometida`);
			}
		}
	}

	Balance.onMessage(message);

	// answer question
	if (!message.content.startsWith(Server.prefix)) {
		if (message.mentions.members?.has(notNull(client.user).id) && message.content.endsWith('?')) {
			timeout[message.author.id] = Date.now();
			const respostas = [
				"Sim",
				"Não",
				"depende",
				"obviamente",
				"talvez...",
				`não sei. Pergunta pro(a) ${message.guild?.members.cache.random().displayName}!`,
				"não quero falar contigo. sai",
				"hmmmm... Já tentou apagar a system32?",
			];

			if (!predictResponse(message)) {
				message.channel.send(
					`${message.author} ${respostas[Math.floor(Math.random() * respostas.length)]}`,
				).catch(defaultErrorHandler);
			}
		} else {
			return;
		}
	}

	// timeout
	if (!message.member?.hasPermission("ADMINISTRATOR") && (timeout[message.author.id] ?? 0) + Server.timeout > Date.now()) {
		message.react(Emojis.no).catch(discordErrorHandler);
		return;
	}

	const rawArgs = message.content.slice(Server.prefix.length).split(' ').filter(s => s !== "");

	let command: Command | undefined;

	const categories = Object.keys(commands);

	for (const cat of categories) {
		let toBreak = false;

		for (const cmd of commands[<keyof typeof commands>cat]) {
			if (cmd.aliases.includes(rawArgs[0])) {
				command = cmd;
				toBreak = true;
				break;
			}
		}

		if (toBreak)
			break;
	}

	if (command === undefined || !message.member || !validatePermissions(message.member, message.channel, command.permissions))
		return;

	const args = parseArgs(rawArgs, message);

	timeout[message.author.id] = Date.now();

	try {
		command.run(message, args, rawArgs).catch(e => {
			console.log(e);
			message.channel.send(`<@${devs[0]}> aconteceu algo de errado, dá uma olhadinha no console aí`)
				.catch(discordErrorHandler);
		});
	} catch (e) {
		console.log(e);
		message.channel.send(`<@${devs[0]}> aconteceu algo de errado, dá uma olhadinha no console aí`)
			.catch(discordErrorHandler);
	}
});

process.on("beforeExit", async () => {
	await Balance.onExit().catch(defaultErrorHandler);
	await Database.done().catch(defaultErrorHandler);
});

client.login(auth.token);