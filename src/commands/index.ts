import * as fs from "fs";
import Discord from "discord.js";
import * as Common from "../common";

// NOTE(ljre): Types and globals
export enum ArgumentKind {
	STRING = "STRING", MEMBER = "MEMBER", CHANNEL = "CHANNEL",
	NUMBER = "NUMBER", TIME = "TIME", EMOJI = "EMOJI",
	SNOWFLAKE = "SNOWFLAKE", USERID = "SNOWFLAKE", ROLE = "ROLE",
}

export type Argument =
	{ kind: ArgumentKind.STRING, value: string, offset: number } |
	{ kind: ArgumentKind.MEMBER, value: Discord.GuildMember, offset: number } |
	{ kind: ArgumentKind.CHANNEL, value: Discord.GuildChannel | Discord.ThreadChannel, offset: number } |
	{ kind: ArgumentKind.NUMBER, value: number, offset: number } |
	{ kind: ArgumentKind.TIME, value: number, offset: number } |
	{ kind: ArgumentKind.EMOJI, value: Discord.Emoji, offset: number } |
	{ kind: ArgumentKind.SNOWFLAKE, value: string, offset: number } |
	{ kind: ArgumentKind.ROLE, value: Discord.Role, offset: number };

export interface Interaction {
	run: (interaction: Discord.CommandInteraction) => Promise<void>,
	options: InteractionOption[];
}

export interface InteractionOption {
	type: InteractionOptionType;
	name: string;
	description: string;
	required?: boolean;
	choices?: InteractionChoice[];
}

export enum InteractionOptionType {
	STRING = 3,
	INTEGER = 4,
	BOOLEAN = 5,
	USER = 6,
	CHANNEL = 7,
	ROLE = 8,
	MENTIONABLE = 9,
	NUMBER = 10,
	ATTACHMENT = 11,
}

export interface InteractionChoice {
	name: string;
	value: string | number;
}

export enum Permission { NONE = 0, SHITPOST = 1, MOD = 2, DEV = 4, RPG_MASTER = 8 }

export interface Command {
	run: (msg: Discord.Message<true>, args: Argument[], raw: string[]) => Promise<void>,
	aliases: string[];
	syntaxes: string[];
	description: string;
	help: string;
	examples: string[];
	permissions: Permission;
	
	interaction?: Interaction;
}

export type ValidChannel = Discord.TextChannel | Discord.ThreadChannel | Discord.NewsChannel;

export interface ApiSlashCommand {
	name: string;
	type: 1;
	description: string;
	options?: InteractionOption[];
}

export const validChannelTypes = [
	Discord.ChannelType.GuildText,
	Discord.ChannelType.PublicThread,
	Discord.ChannelType.PrivateThread,
	Discord.ChannelType.GuildVoice,
	Discord.ChannelType.GuildAnnouncement,
	Discord.ChannelType.AnnouncementThread,
];

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

export const commandsArray: Command[] = Object.values(commands).flat(1);

// NOTE(ljre): Events
export async function init(): Promise<boolean> {
	Common.log("Setting up commands.");

	try {
		let commands: ApiSlashCommand[] = [];
		
		for (const cmd of commandsArray) {
			if (!cmd.interaction)
				continue;
			
			commands.push({
				name: cmd.aliases[0],
				type: 1,
				description: cmd.description,
				options: cmd.interaction.options,
			});
		}
		
		await Common.rest.put(
			Discord.Routes.applicationGuildCommands(Common.notNull(Common.client.user?.id), Common.SERVER.id),
			{ body: commands }
		);
	} catch (err) {
		Common.error("failed to register slash commands: ", err);
	}

	return true;
}

export async function done() {
	
}

export async function message(msg: Discord.Message<true>): Promise<boolean> {
	if (!msg.member || !msg.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) && (timeout[msg.author.id] ?? 0) + Common.SERVER.timeout > Date.now()) {
		msg.react(Common.EMOJIS.no).catch(Common.discordErrorHandler);
		return false;
	}

	if (!msg.content.startsWith(Common.SERVER.prefix))
		return true;

	const text = msg.content.slice(Common.SERVER.prefix.length);
	let offset = Common.SERVER.prefix.length;
	const raw = text
		.split(" ")
		.map(v => {
			let thisOffset = offset;
			offset += v.length + 1;
			return { str: v, offset: thisOffset };
		})
		.filter(v => v.str.length > 0);
	const args = parseArgs(raw, msg);

	if (args.length < 1 || args[0].kind !== "STRING")
		return true;

	for (const cmd of commandsArray) {
		if (cmd.aliases.includes(raw[0].str)) {
			if (validatePermissions(msg.member, <any>msg.channel, cmd.permissions))
				try {
					Common.log(`executing command ${Common.SERVER.prefix}${raw[0]}...`);
					await cmd.run(msg, args, raw.map(v => v.str));
				} catch (error) {
					Common.error(`exception when running command '${raw[0]}': ${error}`);
				}

			break;
		}
	}

	return false;
}

export async function interactionCreate(int_: Discord.Interaction) {
	if (!int_.isCommand())
		return true;
	
	const int = <Discord.CommandInteraction>int_;
	const name = int.commandName;
	const command = commandsArray.find(cmd => cmd.aliases.includes(name));
	
	if (command && command.interaction) {
		const member = await int_.guild?.members.fetch(int_.user.id);
		if (!member) {
			int.reply("unreachable code").catch(Common.discordErrorHandler);
			return false;
		}
		
		if (validatePermissions(member, <any>int_.channel, command.permissions)) {
			try {
				Common.log(`executing command /${command.aliases[0]}...`);
				command.interaction.run(int);
			} catch (err) {
				Common.error(`failed to run command '${name}' in interaction: `, err);
			}
		} else {
			int.reply("cê não tem permissão pra usar esse comando aqui não").catch(Common.discordErrorHandler);
		}
		
		return false; // NOTE(ljre): Stop the pipeline. We already handled the interaction.
	}
	
	return true;
}

// NOTE(ljre): Functions
function parseArgs(raw: {str: string, offset: number}[], msg: Discord.Message): Argument[] {
	const result = <Argument[]>[];
	
	function numberSubstring(str: string): string {
		const match = str.match(/^[0-9]{18}[0-9]*/);
		if (!match || match.length < 1)
			return "";
		
		return match[0];
	}

	for (let rawarg of raw) {
		let { str, offset } = rawarg;

		// if everything below fails, it's a string
		let arg = <Argument> {
			kind: ArgumentKind.STRING,
			value: str,
			offset,
		};

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

				const id = numberSubstring(str);

				if (msg.guild === null)
					continue;
				if (isRole) {
					const role = msg.guild.roles.cache.get(id);
					if (role === undefined)
						continue;

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

				const id = numberSubstring(str);

				if (msg.guild === null)
					continue;
				const channel = msg.guild.channels.cache.get(id);

				if (channel === undefined)
					continue;
				arg.kind = ArgumentKind.CHANNEL;
				arg.value = channel;
			} else if (str[0] === ':' || str.startsWith("a:")) {
				const last = str.indexOf(':', 2);
				const id = numberSubstring(str.slice(last + 1));

				const emoji = Common.client.emojis.cache.get(id);
				if (emoji === undefined)
					continue;
				arg.kind = ArgumentKind.EMOJI;
				arg.value = emoji;
			}

			continue;
		}

		let code = str.charCodeAt(0);

		// parse as number or time
		if (code >= '0'.charCodeAt(0) && code <= '9'.charCodeAt(0)) {

			// 18 chars, check if it's an ID
			if (str.length >= 18) {
				let isntId = false;

				for (let i = 1; i < str.length; ++i) {
					const code = str.charCodeAt(i);

					if (code < '0'.charCodeAt(0) || code > '9'.charCodeAt(0)) {
						isntId = true;
						break;
					}
				}

				if (!isntId) {
					arg.kind = ArgumentKind.SNOWFLAKE;
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

	if (member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) || member.roles.cache.has(Common.ROLES.mod))
		return true;

	if (perms & Permission.MOD)
		return false;

	if (perms & Permission.SHITPOST && !(Common.CHANNELS.shitpost.some(id => id === channel.id) || channel.guild.id === "630891905852506123")) // server secreto
		return false;

	if (perms & Permission.RPG_MASTER && !member.roles.cache.has(Common.ROLES.rpgmaster))
		return false;

	return true;
}
