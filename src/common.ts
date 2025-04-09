import * as Discord from "discord.js";
import https from "node:https";
import Jimp from "jimp";

// NOTE(ljre): Types and globals
export type Result<T = undefined, U = undefined> = Success<T> | Failure<U>;

export interface Success<T> {
	ok: true;
	data: T;
	warning?: string;
}

export interface Failure<T> {
	ok: false;
	error: string;
	extra?: T;
}

export const TIME = {
	second: 1000,
	minute: 1000 * 60,
	hour: 1000 * 60 * 60,
	day: 1000 * 60 * 60 * 24,
	week: 1000 * 60 * 60 * 24 * 7,
	month: 1000 * 60 * 60 * 24 * 30,
	year: 1000 * 60 * 60 * 24 * 365,
};

export const SERVER = {
	// Server dependent.

	id: "507550989629521922",
	prefix: "!!",
	timeout: TIME.second * 5, // timeout for normal members to use commands.
	botColor: 0x30a246, // RGB
	defaultImage: "https://cdn.discordapp.com/attachments/431273314049327104/743175664798007367/unknown.png", // leao
};

export const EMOJIS = {
	// Server dependent.

	yes: '✅',
	no: '666740656483467274',
	horse: '🏇',
	surrender: '<:peepo_surrender:743070678349119609>',
	unity: "743241304405967020",
	gamemaker: "556607844208869386",
	circle: '🔵',
	capitao: "582605020340682773",
};

export const ROLES = {
	// Server dependent.

	muted: "568171976556937226",
	aluno: "585871344718184458",
	unity: "730818777998032967",
	gamemaker: "630202297716178964",
	mod: "507553894310608899",
	event: "758467541239595058",
	gamemaster: "758468120787681340",
	community: "770691692986368050",
	rpgmaster: "918989968876130336",
	rpgplayer: "918990131799658548",
	tagsban: "1359519172660564029",
};

export const CHANNELS = {
	shitpost: ["553933292542361601", "671327942420201492", "835316057014927421"],
	music: "621805258519216130",
	rules: "517857905051959348",
	steamReviews: "760502616898666527",
	log: "589614780470525992",
	joinLog: "742891288055119973",
	faq: "599413245765484544",
	musicConcert: "701148183769645080",
}

export const dev = "373670846792990720"; // NOTE(ljre): My ID.

export let auth: {
	token: string;
	mongo: string;
	mongoURI: string;
	invite: string;
};

export let rest: Discord.REST;
export let client: Discord.Client;
export let apiTimeout: number = 0;

// NOTE(ljre): API
export function setupGlobals(client_: Discord.Client, rest_: Discord.REST, auth_: any) {
	// NOTE(ljre): Needed since we can't assign to exported globals from other modules.

	client = client_;
	rest = rest_;
	auth = auth_;
}

export function log(...args: any[]) { console.log(`[log] `, ...args); }
export function warning(...args: any[]) { console.log(`[warning] `, ...args); }
export function error(...args: any[]) {
	console.log(`[error] `, ...args);
	console.log(String(new Error().stack).split("\n").slice(1).join("\n"));
}

export function discordErrorHandler(err: any) {
	error(err);

	if (err.retry_after && err.message === "You are being rate limited.") {
		apiTimeout = Date.now() + Number(err.retry_after);
	}
}

export function notNull<T>(value: T | undefined | null): T {
	return <T>value;
}

export function formatTime(ms: number): string {
	let str: string[] = [];
	let months = 0;

	switch (true) {
		case ms >= TIME.year:
			const years = Math.trunc(ms / TIME.year);
			ms = ms % TIME.year;
			str.push(`${years} ano${years > 1 ? 's' : ''}`);

		case ms >= TIME.month:
			months = Math.trunc(ms / TIME.month);
			ms = ms % TIME.month;
			if (months > 0)
				str.push(`${months} m${months > 1 ? 'eses' : 'ês'}`);

		case ms >= TIME.week:
			if (months === 0) {
				const weeks = Math.trunc(ms / TIME.week);
				ms = ms % TIME.week;
				if (weeks > 0)
					str.push(`${weeks} semana${weeks > 1 ? 's' : ''}`);
			}

		case ms >= TIME.day:
			const days = Math.trunc(ms / TIME.day);
			ms = ms % TIME.day;
			if (days > 0)
				str.push(`${days} dia${days > 1 ? 's' : ''}`);

		case ms >= TIME.hour:
			const hours = Math.trunc(ms / TIME.hour);
			ms = ms % TIME.hour;
			if (hours > 0)
				str.push(`${hours} hora${hours > 1 ? 's' : ''}`);

		case ms >= TIME.minute:
			const minutes = Math.trunc(ms / TIME.minute);
			ms = ms % TIME.minute;
			if (minutes > 0)
				str.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);

		case ms >= TIME.second:
			const seconds = Math.trunc(ms / TIME.second);
			ms = ms % TIME.second;
			if (seconds > 0)
				str.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);
			break;
	}

	if (str.length === 0) {
		return "alguns instantes";
	} else if (str.length === 1) {
		return str[0];
	} else if (str.length > 3) {
		str = str.slice(0, 3);
	}

	let last = str[str.length - 1];
	str = str.slice(0, str.length - 1);
	let final = str.join(", ") + " e " + last;
	return final;
}

export function formatBasicTime(ms: number): string {
	switch (true) {
		case ms > TIME.week:
			const weeks = Math.trunc(ms / TIME.week);
			ms = ms % TIME.week;
			return (`${weeks} semana${weeks > 1 ? 's' : ''}`);

		case ms > TIME.day:
			const days = Math.trunc(ms / TIME.day);
			ms = ms % TIME.day;
			return (`${days} dia${days > 1 ? 's' : ''}`);

		case ms > TIME.hour:
			const hours = Math.trunc(ms / TIME.hour);
			ms = ms % TIME.hour;
			return (`${hours} hora${hours > 1 ? 's' : ''}`);

		case ms > TIME.minute:
			const minutes = Math.trunc(ms / TIME.minute);
			ms = ms % TIME.minute;
			return (`${minutes} minuto${minutes > 1 ? 's' : ''}`);

		case ms > TIME.second:
			const seconds = Math.trunc(ms / TIME.second);
			ms = ms % TIME.second;
			return (`${seconds} segundo${seconds > 1 ? 's' : ''}`);
		default:
			return `alguns instantes`;
	}
}

export function parseTime(s: string): Result<number> {
	let result = 0;
	let len = 0;

	while (len < s.length) {
		let t = parseInt(s.slice(len));
		len += String(t).length;

		const k = s[len++];
		if (!k)
			return { ok: false, error: "Tempo inválido" };

		switch (k) {
			case 'y': t *= TIME.year; break;
			case 't': t *= TIME.month; break;
			case 'w': t *= TIME.week; break;
			case 'd': t *= TIME.day; break;
			case 'h': t *= TIME.hour; break;
			case 'm': t *= TIME.minute; break;
			default: return { ok: false, error: "Tempo inválido" };
		}

		result += t;

	}

	return { ok: true, data: result };
}

export function dateOf(time: number) {
	const d = new Date(time - TIME.hour * 3);
	const date = `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
	const hour = `${d.getUTCHours()}h${d.getUTCMinutes()}`;
	return `${date} - ${hour}`;
}

export function defaultEmbed(member: Discord.GuildMember | Discord.User): any {
	let name: string;
	let avatar: string | null;
	
	if (isMember(member)) {
		name = member.displayName;
		avatar = member.user?.avatarURL();
	} else {
		name = member.username;
		avatar = member.avatarURL();
	}
	
	return {
		type: Discord.EmbedType.Rich,
		color: SERVER.botColor,
		author: { name, icon_url: avatar ?? undefined },
		footer: { text: client.user?.username, icon_url: client.user?.avatarURL() ?? undefined },
		fields: [],
	};
}

export function emptyEmbed(): any {
	return {
		type: "rich",
		fields: [],
	};
}

export function isMember(user: Discord.User | Discord.GuildMember): user is Discord.GuildMember {
	return (<any>user).roles !== undefined;
}

export function simpleRequest(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		https.get(url, {}, (res) => {
			let data = "";

			if (res.statusCode !== 200) {
				reject(res.statusCode);
				return;
			}

			res.on("data", (chunk) => data += chunk);
			res.on("end", () => resolve(data));
			res.on("error", (err) => (error(err.toString()), reject(err)))
		}).on("error", (err) => (error(err.toString()), reject(err)));
	});
}

const formats = [".jpeg", ".jpg", ".png", ".bmp"];
function isImage(name: string | undefined | null): boolean {
	if (!name)
		return false;

	const i = name.indexOf('?');
	if (i !== -1)
		name = name.substr(0, i);

	for (const f of formats) {
		if (name.endsWith(f))
			return true;
	}

	return false;
}

import * as Commands from "./commands";

export function imageFrom(msg: Discord.Message, args: Commands.Argument[]) {
	function imageAttached(msg: Discord.Message): string | undefined {
		const attcs = msg.attachments.values();

		for (const attc of attcs) {
			if (isImage(attc.name) && (attc.width ?? Infinity) <= 1280 && (attc.height ?? Infinity) <= 720) {
				return attc.url;
			}
		}

		const args = msg.content.split(' ');
		const link = args.find(arg => arg.match(/^https?:\/\//));
		if (link && isImage(link))
			return link;

		return undefined;
	}

	const img = imageAttached(msg);
	if (img) return img;

	const emoji = <{ kind: "EMOJI", value: Discord.Emoji }>args.find(arg => arg.kind === Commands.ArgumentKind.EMOJI);
	if (emoji)
		return emoji.value.url ?? SERVER.defaultImage;

	const channel = <Discord.TextChannel>msg.channel;
	const messages = Array.from(channel.messages.cache.values()).reverse().slice(0, 20);
	for (const m of messages) {
		const img = imageAttached(m);
		if (img) return img;
	}

	return undefined;
}

export function processImage(img: string | Jimp, callback: (image: Jimp) => any) {
	if (typeof img === "string")
		return Jimp.read(img).then(image => {
			callback(image);
		});
	else
		return new Promise<Jimp>(resolve => {
			resolve(img);
		}).then(callback);
}

export function imageAsAttachment(buffer: Buffer, format: string): Discord.BaseMessageOptions {
	return { files: [{ attachment: buffer, name: `image.${format}` }] };
}

export function allowedImage(image: Jimp) {
	return image.getWidth() <= 800 && image.getHeight() <= 800;
}

export function validateEmbed(embed: any): Result {
	if (typeof embed.description === "string" && embed.description.length > 4096)
		return { ok: false, error: "description too long" };
	if (typeof embed.title === "string" && embed.title.length > 256)
		return { ok: false, error: "title too long" };
	if (embed.footer && typeof embed.footer.text === "string" && embed.footer.text.length > 2048)
		return { ok: false, error: "footer text too long" };
	if (embed.author && typeof embed.author.text === "string" && embed.author.text.length > 256)
		return { ok: false, error: "author name too long" };
	if (Array.isArray(embed.fields) && embed.fields.length > 25)
		return { ok: false, error: "too much fields" };
	
	for (let i = 0; i < embed.fields.length; ++i) {
		const field = embed.fields[i];
		if (!field)
			return { ok: false, error: `field index ${i} is undefined` };
		
		if (typeof field.name === "string" && field.name.length > 256)
			return { ok: false, error: `field index ${i} has name too long` };
		if (typeof field.value === "string" && field.value.length > 1024)
			return { ok: false, error: `field index ${i} has value too big` };
	}
	
	return { ok: true, data: undefined };
}

export function fixEmbedIfNeeded(embed: any): any {
	if (embed.description && typeof embed.description === "string")
		embed.description = embed.description.slice(0, 4096);
	if (embed.title && typeof embed.title === "string")
		embed.title = embed.title.slice(0, 256);
	if (embed.footer && embed.footer.text && typeof embed.footer.text === "string")
		embed.footer.text = embed.footer.text.slice(0, 2048);
	if (embed.author && embed.author.text && typeof embed.author.text === "string")
		embed.author.text = embed.author.text.slice(0, 256);
	if (embed.fields && Array.isArray(embed.fields)) {
		embed.fields = embed.fields.slice(0, 25);
		
		for (const field of embed.fields) {
			if (!field)
				continue;
			
			if (typeof field.name === "string")
				field.name = field.name.slice(0, 256);
			if (typeof field.value === "string")
				field.value = field.value.slice(0, 1024);
		}
		
		embed.fields = embed.fields.filter((field: any) => field && field.name && field.value);
	}
	
	return embed;
}

export function removeMentions(str: string, channel: Discord.TextChannel, allowedList: string[] = []): string {
	const pattern = /<@!?(&?[0-9]+)>/;
	let result = str;
	let skipIndex = 0; // ignore everything before this index
	
	let found: any;
	while (found = result.slice(skipIndex).match(pattern), found !== null) {
		const index = found.index;
		const id = found[1];
		if (allowedList.includes(id)) {
			skipIndex += index + found[0].length;
			continue;
		}
		
		let replaceWith: string;
		
		if (id[0] === '&') {
			const role = channel.guild.roles.cache.get(id.slice(1));
			
			if (role)
				replaceWith = role.name;
			else
				replaceWith = "invalid-role";
		} else {
			const member = channel.guild.members.cache.get(id);
			
			if (member) {
				replaceWith = member.displayName;
			} else {
				const user = channel.client.users.cache.get(id);
				
				if (user)
					replaceWith = user.username;
				else
					replaceWith = "invalid-user";
			}
		} 
		
		result = result.replace(found[0], '@' + replaceWith);
	}
	
	return result;
	
	/*
	
	function _removeMention(str: string, channel: Discord.TextChannel){
		return str.replace(/<@!?[0-9]+>/g, input => {
			const id = input.replace(/<|!|>|@/g, '');
			const member = channel.guild.members.cache.get(id);
			if(member) {
				return `@${member.displayName}`.replace(/@/g, '@\u200b');
			} else {
				const user = channel.client.users.cache.get(id);
				return user?(`@${user.username}`.replace(/@/g, '@\u200b')):input;
			}
		})
		.replace(/<@&[0-9]+>/g, input => {
			const role = channel.guild.roles.cache.get(input.replace(/<|@|>|&/g, ''));
			return role ? `@${role.name}` : input;
		});
	}
	
	if (allowedList) {
		let msg = '';
		const tokenized = msg.split(/<@([^>]*)>/g);
		tokenized.forEach(token =>{
			if(!allowedList.includes(token)){
				msg += _removeMention(token, channel);
			}
			else{
				msg += token;
			}
			console.log(msg);
		});
		return msg || str;
	}
	else{
		return _removeMention(str, channel);
	}*/
}
