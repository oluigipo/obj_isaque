import { Client, Message, GuildMember, TextChannel } from "discord.js";
import {
	Server, Command, devs, Arguments, ASCII, Argument, ArgumentKind,
	parseTime, discordErrorHandler, Permission, Channels, defaultErrorHandler,
	notNull
} from "./defs";
import * as Moderation from "./moderation";
import * as Database from "./database";
import * as fs from "fs";
import commands from "./commands";

const auth = JSON.parse(fs.readFileSync("auth.json", "utf8"));
const client = new Client();

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

function validadePermissions(member: GuildMember, channel: TextChannel, perms: Permission): boolean {
	if (perms & Permission.DEV && !devs.includes(member.id))
		return false;

	if (member.hasPermission("ADMINISTRATOR"))
		return true;

	if (perms & Permission.MOD)
		return false;

	if (perms & Permission.SHITPOST && !Channels.shitpost.some(id => id === channel.id))
		return false;

	// @NOTE(luigi): need more permissions?

	return true;
}

function predictResponse(msg: Message) {
	if (msg.content.toLowerCase().includes("sentido da vida")) {
		msg.channel.send(`${msg.author} é simples: 42`).catch(defaultErrorHandler);
		return true;
	}

	return false;
}

client.on("ready", async () => {
	await Database.init(auth.mongo).catch(defaultErrorHandler);
	await Moderation.init(client).catch(defaultErrorHandler);

	notNull(client.user).setPresence({ activity: { name: "o curso do NoNe!", type: "WATCHING" }, status: "online" })
		.catch(discordErrorHandler);

	console.log("Online!");
});

// @TODO(luigi): fix "User is not Connected to Voice Channel"
// client.on("voiceStateUpdate", (state0, state1) => {
// 	if (state1.channelID === undefined) return;
// 	if (state1.channelID === state0.channelID) return;

// 	if (!state1.member)
// 		return;

// 	if (Moderation.isMuted(state1.member.id)) {
// 		if (!state1.mute) state1.setMute(true).catch(discordErrorHandler);
// 	} else {
// 		if (state1.mute) state1.setMute(false).catch(discordErrorHandler);
// 	}
// });

client.on("message", (message) => {
	if (message.author.bot || message.channel.type !== "text")
		return;

	// timeout
	if ((timeout[message.author.id] ?? 0) + Server.timeout > Date.now())
		return;

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

	const rawArgs = message.content.slice(Server.prefix.length).split(' ').filter(s => s !== "");

	let command: Command | undefined;
	for (const cmd of commands) {
		if (cmd.aliases.includes(rawArgs[0])) {
			command = cmd;
			break;
		}
	}

	if (command === undefined || !message.member || !validadePermissions(message.member, message.channel, command.permissions))
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
	await Database.done().catch(defaultErrorHandler);
});

client.login(auth.token);