import * as fs from "fs";
import Discord from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import * as Common from "../common";

// NOTE(ljre): Types and globals
export enum ArgumentKind {
	STRING = "STRING", MEMBER = "MEMBER", CHANNEL = "CHANNEL",
	NUMBER = "NUMBER", TIME = "TIME", EMOJI = "EMOJI",
	USERID = "USERID", ROLE = "ROLE",
}

export type Argument =
	{ kind: ArgumentKind.STRING, value: string } |
	{ kind: ArgumentKind.MEMBER, value: Discord.GuildMember } |
	{ kind: ArgumentKind.CHANNEL, value: Discord.GuildChannel | Discord.ThreadChannel } |
	{ kind: ArgumentKind.NUMBER, value: number } |
	{ kind: ArgumentKind.TIME, value: number } |
	{ kind: ArgumentKind.EMOJI, value: Discord.Emoji } |
	{ kind: ArgumentKind.USERID, value: string } |
	{ kind: ArgumentKind.ROLE, value: Discord.Role };

export enum Permission { NONE, SHITPOST, MOD, DEV, RPG_MASTER }

export interface Command {
	run: (msg: Discord.Message, args: Argument[], raw: string[]) => Promise<void>,
	aliases: string[];
	syntaxes: string[];
	description: string;
	help: string;
	examples: string[];
	permissions: Permission;
}

export type ValidChannel = Discord.TextChannel | Discord.ThreadChannel | Discord.NewsChannel;

export const validChannelTypes = [ "GUILD_TEXT", "GUILD_PUBLIC_THREAD", "GUILD_PRIVATE_THREAD", "GUILD_NEWS_THREAD", "GUILD_NEWS" ];

const timeout = <{ [key: string]: number }>{};

import CmdBalance from "./balance";
import CmdGames from "./games";
import CmdImage from "./image";
import CmdMicellaneus from "./micellaneus";
import CmdMods from "./mods";
import CmdUtils from "./utils";

export const commands = {
	balance: CmdBalance,
	games: CmdGames,
	image: CmdImage,
	micellaneus: CmdMicellaneus,
	mods: CmdMods,
	utils: CmdUtils,
};

export const commandsArray = (Object.keys(commands) as any).map((key: any) => (commands as any)[key]).flat(1);

// NOTE(ljre): Events
export async function init(): Promise<boolean> {
	Common.log("Setting up commands.");

	return true;
}

export async function done() {
	
}

export async function message(message: Discord.Message): Promise<boolean> {
	if (!message.member?.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) && (timeout[message.author.id] ?? 0) + Common.SERVER.timeout > Date.now()) {
		message.react(Common.EMOJIS.no).catch(Common.discordErrorHandler);
		return false;
	}

	if (!message.content.startsWith(Common.SERVER.prefix))
		return true;

	const text = message.content.slice(Common.SERVER.prefix.length);
	const raw = text.split(" ").filter(v => v.length > 0);
	const args = parseArgs(raw, message);

	if (args.length < 1 || args[0].kind !== "STRING")
		return true;

	for (const cmd of commandsArray) {
		if (cmd.aliases.includes(raw[0])) {
			try {
				await cmd.run(message, args, raw);
			} catch (error) {
				Common.error(`exception when running command '${raw[0]}': ${error}`);
			}

			break;
		}
	}

	return false;
}

// NOTE(ljre): Functions
function parseArgs(raw: string[], msg: Discord.Message): Argument[] {
	const result = <Argument[]>[];

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

				const emoji = Common.client.emojis.cache.get(id);
				if (emoji === undefined) continue;
				arg.kind = ArgumentKind.EMOJI;
				arg.value = emoji;
			}

			continue;
		}

		let code = str.charCodeAt(0);

		// parse as number or time
		if (code >= '0'.charCodeAt(0) && code <= '9'.charCodeAt(0)) {

			// 18 chars, check if it's an ID
			if (str.length == 18) {
				let isntId = false;

				for (let i = 1; i < str.length; ++i) {
					const code = str.charCodeAt(i);

					if (code < '0'.charCodeAt(0) || code > '9'.charCodeAt(0)) {
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
				const result = Common.parseTime(str);

				if (result.ok) {
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

export function validatePermissions(member: Discord.GuildMember, channel: Discord.TextChannel | Discord.NewsChannel, perms: Permission): boolean {
	if (perms & Permission.DEV && Common.dev !== member.id)
		return false;

	if (member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) || member.roles.cache.has(Common.ROLES.mod))
		return true;

	if (perms & Permission.MOD)
		return false;

	if (perms & Permission.SHITPOST && !(Common.CHANNELS.shitpost.some(id => id === channel.id) || channel.guild.id === "630891905852506123")) // server secreto
		return false;

	if (perms & Permission.RPG_MASTER && !member.roles.cache.has(Common.ROLES.rpgmaster))
		return false;

	// @NOTE(luigi): need more permissions?

	return true;
}
