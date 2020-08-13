import { Message, GuildMember, GuildChannel, User, MessageEmbed } from "discord.js";

export enum ArgumentKind { STRING, MEMBER, CHANNEL, NUMBER, TIME }
export type Argument =
	{ kind: ArgumentKind.STRING, value: string } |
	{ kind: ArgumentKind.MEMBER, value: GuildMember } |
	{ kind: ArgumentKind.CHANNEL, value: GuildChannel } |
	{ kind: ArgumentKind.NUMBER, value: number } |
	{ kind: ArgumentKind.TIME, value: number };

export type Arguments = Argument[];

export enum Permission { NONE = 0, SHITPOST = 1, MOD = 2, DEV = 4 }

export type Response<T> = Success<T> | Failure;

export interface Success<T> {
	success: true;
	data: T;
	warning?: string;
}

export interface Failure {
	success: false;
	error: string;
}

export interface Command {
	run: (msg: Message, args: Arguments, raw: string[]) => Promise<any>;
	aliases: string[];
	syntaxes: string[];
	description: string;
	help: string;
	examples: string[];
	permissions: Permission;
	subcommands?: Command[];
}

// Constants
export const devs = ["373670846792990720", "330403904992837632"];

export const Time = {
	second: 1000,
	minute: 1000 * 60,
	hour: 1000 * 60 * 60,
	day: 1000 * 60 * 60 * 24,
	week: 1000 * 60 * 60 * 24 * 7
};

export const Server = {
	specialInvite: "p9WN6Rx",
	id: "507550989629521922",
	prefix: "!!",
	botcolor: 0x30a246,
	timeout: Time.second * 3
};

export const Channels = {
	shitpost: ["553933292542361601", "671327942420201492"],
	music: "621805258519216130"
}

export const Emojis = {
	yes: '✅',
	no: '<:error:666740656483467274>',
	horse: '🏇',
	surrender: '<:peepo_surrender:743070678349119609>'
};

export const Roles = {
	muted: "568171976556937226"
};

export const MsgTemplates = {
	error: (user: User, command: string) => `${Emojis.no} | ${user} Argumentos inválidos! Tente ver como esse comando funciona usando \`${Server.prefix}help ${command}\`.`
};

// Functions
export function formatTime(ms: number): string {
	let str: string[] = [];

	switch (true) {
		case ms > Time.week:
			const weeks: number = Math.trunc(ms / Time.week);
			ms = ms % Time.week;
			str.push(`${weeks} semana${weeks > 1 ? 's' : ''}`);

		case ms > Time.day:
			const days = Math.trunc(ms / Time.day);
			ms = ms % Time.day;
			if (days > 0)
				str.push(`${days} dia${days > 1 ? 's' : ''}`);

		case ms > Time.hour:
			const hours = Math.trunc(ms / Time.hour);
			ms = ms % Time.hour;
			if (hours > 0)
				str.push(`${hours} hora${hours > 1 ? 's' : ''}`);

		case ms > Time.minute:
			const minutes = Math.trunc(ms / Time.minute);
			ms = ms % Time.minute;
			if (minutes > 0)
				str.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);

		case ms > Time.second:
			const seconds = Math.trunc(ms / Time.second);
			ms = ms % Time.second;
			if (seconds > 0)
				str.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);
			break;
	}
	if (str.length === 0) {
		return "alguns instantes";
	} else if (str.length === 1) {
		return str[0];
	}

	let last = str[str.length - 1];
	str = str.slice(0, str.length - 1);
	let final = str.join(", ") + " e " + last;
	return final;
}

export function formatBasicTime(ms: number): string {
	switch (true) {
		case ms > Time.week:
			const weeks: number = Math.trunc(ms / Time.week);
			ms = ms % Time.week;
			return (`${weeks} semana${weeks > 1 ? 's' : ''}`);

		case ms > Time.day:
			const days = Math.trunc(ms / Time.day);
			ms = ms % Time.day;
			return (`${days} dia${days > 1 ? 's' : ''}`);

		case ms > Time.hour:
			const hours = Math.trunc(ms / Time.hour);
			ms = ms % Time.hour;
			return (`${hours} hora${hours > 1 ? 's' : ''}`);

		case ms > Time.minute:
			const minutes = Math.trunc(ms / Time.minute);
			ms = ms % Time.minute;
			return (`${minutes} minuto${minutes > 1 ? 's' : ''}`);

		case ms > Time.second:
			const seconds = Math.trunc(ms / Time.second);
			ms = ms % Time.second;
			return (`${seconds} segundo${seconds > 1 ? 's' : ''}`);
		default:
			return `alguns instantes`;
	}
}

// @NOTE(luigi): do we really need this function?
export function matchArgs(args: Arguments, ...kinds: ArgumentKind[]): boolean {
	if (args.length < kinds.length)
		return false;

	for (let i = 0; i < kinds.length; i++) {
		if (args[i].kind !== kinds[i])
			return false;
	}

	return true;
}

// @NOTE(luigi): maybe better name?
export function ASCII(s: string) {
	return s.charCodeAt(0);
}

export function parseTime(s: string): Response<number> {
	let result = 0;
	let len = 0;

	while (len < s.length) {
		let t = parseInt(s.slice(len));
		len += String(t).length;

		const k = s[len++];
		if (!k)
			return { success: false, error: "Tempo inválido" };

		switch (k) {
			case 'w': t *= Time.week; break;
			case 'd': t *= Time.day; break;
			case 'h': t *= Time.hour; break;
			case 'm': t *= Time.minute; break;
			default: return { success: false, error: "Tempo inválido" };
		}

		result += t;

	}

	return { success: true, data: result };
}

export function defaultErrorHandler(err: any) {
	console.log(`====================================\n[ERROR] defaultErrorHandler(error)\n`);
	console.log(err);
}

export async function discordErrorHandler(err: any) {
	console.log("====================================\n[ERROR] discordErrorHandler(error)\n");
	console.log(err);

	if (err.message === "You are being rate limited.")
		await sleep(err.retry_after ?? (Time.second * 10));
}

export function defaultEmbed(member: GuildMember) {
	const final = new MessageEmbed();
	final.color = Server.botcolor;
	final.author = { name: member.displayName, iconURL: member.user.avatarURL() ?? undefined };
	final.footer = { text: member.client.user?.username, iconURL: member.client.user?.avatarURL() ?? undefined };

	return final;
}

export function notNull<T>(arg: T | null): T {
	return <T>arg;
}

function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function dateOf(time: number) {
	const d = new Date(time + (new Date().getTimezoneOffset() - 180));
	return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} - ${
		d.getHours().toString().padStart(2, '0')}h${d.getMinutes().toString().padStart(2, '0')}`;
}
