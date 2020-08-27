import { Client, Message, GuildMember, TextChannel, Guild } from "discord.js";
import {
	Server, Command, devs, Arguments, ASCII, Argument, ArgumentKind,
	parseTime, discordErrorHandler, Permission, Channels, defaultErrorHandler,
	notNull, validatePermissions, Roles, Emojis
} from "./defs";
import * as Moderation from "./moderation";
import * as Database from "./database";
import * as Balance from "./balance";
import * as fs from "fs";
import commands from "./commands";

// @TODO(luigi): !!curse invite

const auth = JSON.parse(fs.readFileSync("auth.json", "utf8"));
Server.specialInvite = auth.invite;
const client = new Client();
type Invites = { [key: string]: number };
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
				str = str.substr(1 + Number(str[1] === '!'));

				const id = str.substr(0, 18);

				if (msg.guild === null) continue;
				const member = msg.guild.members.cache.get(id);

				if (member === undefined) continue;
				arg.kind = ArgumentKind.MEMBER;
				arg.value = member;
			} else if (str[1] === '#') {
				str = str.substr(1);

				const id = str.substr(0, 18);

				if (msg.guild === null) continue;
				const channel = msg.guild.channels.cache.get(id);

				if (channel === undefined) continue;
				arg.kind = ArgumentKind.CHANNEL;
				arg.value = channel;
			}

			continue;
		}

		let code = str.charCodeAt(0);

		// parse as number or time
		if (code >= ASCII('0') && code <= ASCII('9')) {
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
		inv.forEach((value) => invites[value.code] = value.uses ?? 0);
		return invites;
	}

	return undefined;
}

client.on("ready", async () => {
	await Database.init(auth.mongoURI, auth.mongo).catch(defaultErrorHandler);
	await Moderation.init(client).catch(defaultErrorHandler);
	await Balance.init(client).catch(defaultErrorHandler);

	// @NOTE(luigi): what?
	invites = (<Invites | undefined>await fetchInvites().catch(discordErrorHandler)) ?? {};

	notNull(client.user).setPresence({ activity: { name: "o curso do NoNe!", type: "WATCHING" }, status: "online" })
		.catch(discordErrorHandler);

	// @NOTE(luigi): what?²
	(<TextChannel>client.guilds.cache.get(Server.id)?.channels.cache.get(Channels.rules)).messages.fetch().catch(discordErrorHandler);

	console.log("Online!");
});

client.on("messageReactionAdd", (reaction, user) => {
	if (reaction.message.id !== Server.rolepickMsg)
		return;

	const member = reaction.message.guild?.members.cache.get(user.id);

	if (!member)
		return;

	if (reaction.emoji.id === Emojis.unity && !member.roles.cache.has(Roles.unity)) // unity
		member.roles.add(Roles.unity).catch(discordErrorHandler);
	else if (reaction.emoji.id === Emojis.gamemaker && !member.roles.cache.has(Roles.gamemaker)) // game maker
		member.roles.add(Roles.gamemaker).catch(discordErrorHandler);
});

client.on("messageReactionRemove", (reaction, user) => {
	if (reaction.message.id !== Server.rolepickMsg)
		return;

	const member = reaction.message.guild?.members.cache.get(user.id);

	if (!member)
		return;

	if (reaction.emoji.id === Emojis.unity && member.roles.cache.has(Roles.unity)) // unity
		member.roles.remove(Roles.unity).catch(discordErrorHandler);
	else if (reaction.emoji.id === Emojis.gamemaker && member.roles.cache.has(Roles.gamemaker)) // game maker
		member.roles.remove(Roles.gamemaker).catch(discordErrorHandler);
});

client.on("guildMemberAdd", async member => {
	if (member.guild.id !== Server.id) return;
	if (Moderation.isMuted(member.id))
		member.roles.add(Roles.muted).catch(discordErrorHandler);

	const newInvites = (<Invites>await fetchInvites().catch(discordErrorHandler));

	if (newInvites[Server.specialInvite] > invites[Server.specialInvite]) {
		member.roles.add(Roles.aluno).catch(discordErrorHandler);
	}

	invites = newInvites;
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
	if (message.author.bot || message.channel.type !== "text" || message.guild === null)
		return;

	Balance.onMessage(message);

	// answer question
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
				`<@${message.author}> ${
				respostas[Math.floor(Math.random() * respostas.length)]
				}`,
			).catch(defaultErrorHandler);
		}
	}

	if (!message.content.startsWith(Server.prefix))
		return;

	// timeout
	if (!message.member?.hasPermission("ADMINISTRATOR") && (timeout[message.author.id] ?? 0) + Server.timeout > Date.now()) {
		message.react(Emojis.no).catch(discordErrorHandler);
		return;
	}

	const rawArgs = message.content.slice(Server.prefix.length).split(' ').filter(s => s !== "");

	let command: Command | undefined;
	for (const cmd of commands) {
		if (cmd.aliases.includes(rawArgs[0])) {
			command = cmd;
			break;
		}
	}

	if (command === undefined || !message.member || !validatePermissions(message.member, message.channel, command.permissions))
		return;

	const args = parseArgs(rawArgs, message);

	timeout[message.author.id] = Date.now();

	command.run(message, args, rawArgs).catch(e => {
		console.log(e);
		message.channel.send(`<@${devs[0]}> aconteceu algo de errado, dá uma olhadinha no console aí`)
			.catch(discordErrorHandler);
	});
});

process.on("beforeExit", async () => {
	await Balance.onExit().catch(defaultErrorHandler);
	await Database.done().catch(defaultErrorHandler);
});

client.login(auth.token);