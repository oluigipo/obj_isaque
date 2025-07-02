import Discord from "discord.js";
import * as Common from "./common";
import * as Database from "./database";
import crypto from "crypto";

// NOTE(ljre): Types and globals
export interface Mute {
	id: string;
	time: number;
	duration: number;
	reason?: string;
}

export type FormatedMute = { user: string, ends: string, begins: string, duration: string, reason?: string };

export let mutes: Mute[];

export const readDb = () => Database.readCollection("mutes", "mutes");
export const updateDb = () => Database.writeCollection("mutes", "mutes", mutes);

export let logChannel: Discord.TextChannel;

let cursedInvites: string[] = [];

// NOTE(ljre): Events
export async function init() {
	mutes = await readDb();
	logChannel = <Discord.TextChannel>await Common.client.channels.fetch(Common.CHANNELS.log).catch(Common.discordErrorHandler);

	if (!logChannel) {
		Common.error("could not fetch moderation log's channel!");
		return false;
	}

	autoUnmute();

	return true;
}

export async function done() {
	await updateDb();
}

export async function message(message: Discord.Message<true>) {
	if (message.content.includes("@everyone") && !message.mentions.everyone && message.member) {
		message.delete().catch(Common.discordErrorHandler);

		if (!isMuted(message.member.id)) {
			Common.log(`possivel conta compromedita detectada: ${message.member.id}`);

			let r = mute(message.member.id, Common.TIME.day, "possivelmente conta hackeada", message.member);

			if (r.ok)
				message.channel.send(`usuário ${message.author} mutado: conta possivelmente comprometida`).catch(Common.discordErrorHandler);
		}

		return false;
	}

	if (isProbablyABotSpamming(message)) {
		const member = Common.notNull(message.member);
		if (member.bannable) {
			try {
				// NOTE(ljre): for now, just mute
				if (false) {
					await member.ban({
						reason: "provavelmente um bot spammando",
						deleteMessageSeconds: 24 * Common.TIME.hour,
					});

					const embed = Common.defaultEmbed(member);
					embed.description = `provavelmente um bot spammando: ${member}`;
					delete embed.footer;
					delete embed.color;
					await logChannel.send({ embeds: [embed] });
				} else {
					const result = mute(member.id, 1 * Common.TIME.day, "provavelmente um bot spammando", member);
					
					const embed = Common.defaultEmbed(member);
					embed.description = `[Ir para a mensagem](${message.url})\nprovavelmente um bot spammando: ${member}`;
					if (!result.ok) {
						embed.description += `\nerro: ${result.error}`;
					} else if (result.warning) {
						embed.description += `\nwarning: ${result.warning}`;
					}
					delete embed.footer;
					delete embed.color;
					await logChannel.send({ embeds: [embed] });
				}
			} catch (err) {
				console.error(err);
			}
		}
	}
}

export async function memberJoined(member: Discord.GuildMember, invite: string | undefined) {
	if (cursedInvites.includes(invite ?? "") && member.bannable)
		member.ban({ reason: "cursed invite: " + invite }).catch(Common.discordErrorHandler);
	if (isMuted(member.id))
		member.roles.add(Common.ROLES.muted).catch(Common.discordErrorHandler);
}

// NOTE(ljre): Functions
function autoUnmute() {
	let changed = false;
	const now = Date.now();

	// console.log("autoUnmute Begin");
	// console.log(mutes);
	for (let i = 0; i < mutes.length;) {
		const mute = mutes[i];
		if (mute.duration !== -1 && mute.time + mute.duration < now) {
			weakunmute(mute.id);
			changed = true;
			continue;
		}

		++i;
	}

	// console.log("autoUnmute End" + (changed ? " (changed)" : ""));
	// console.log(mutes);

	if (changed)
		updateDb();
	setTimeout(autoUnmute, Common.TIME.minute);
}

// NOTE(ljre): API
/**
 * @returns On success: when the mute ends
 * @note This function DOESN'T update the database when it's called
 * @param userid Id of the user
 * @param duration Mute duration. -1 if undefined
 */
export function weakmute(userid: string, duration: number = -1, reason?: string, member?: Discord.GuildMember): Common.Result<number> {
	let index = mutes.length;
	let warning: string | undefined;

	// check for override
	for (let i = 0; i < mutes.length; ++i)
		if (mutes[i].id === userid) {
			index = i;
			warning = `Usuário já estava mutado antes.`;
			break;
		}

	if (!member) {
		const c = Common.client.guilds.cache.get(Common.SERVER.id)?.members.cache.get(userid);

		if (c === undefined) {
			return { ok: false, error: "Membro desconhecido" };
		}

		member = c;
	}

	member.roles.add(Common.ROLES.muted).catch(Common.discordErrorHandler);

	const now = Date.now();
	mutes[index] = { id: userid, time: now, duration, reason };
	return { ok: true, data: now + duration, warning };
}

/**
 * @returns On success: when the mute ends
 * @note This function DOES update the database when it's called
 * @param userid Id of the user
 * @param duration Mute duration. -1 if undefined
 */
export function mute(userid: string, duration: number = -1, reason?: string, member?: Discord.GuildMember) {
	const result = weakmute(userid, duration, reason, member);
	if (result.ok)
		updateDb();
	return result;
}

/**
 * @returns On success: when the mute would end
 * @note This function DOESN'T update the database when it's called
 * @param userid Id of the user
 */
export function weakunmute(userid: string, member?: Discord.GuildMember): Common.Result<number> {
	for (let i = 0; i < mutes.length; ++i)
		if (mutes[i].id === userid) {
			const mute = mutes[i];
			mutes = mutes.filter((_, index) => index !== i);

			if (!member) {
				const c = Common.client.guilds.cache.get(Common.SERVER.id)?.members.cache.get(userid);
				if (c === undefined) {
					return {
						ok: true,
						data: mute.time + mute.duration,
						warning: "Ele deve ter saído do servidor, então eu só tirei ele da database."
					};
				}

				member = c;
			}

			member.roles.remove(Common.ROLES.muted).catch(Common.discordErrorHandler);

			return { ok: true, data: mute.time + mute.duration };
		}

	return { ok: false, error: "Esse usuário não está mutado." };
}

/**
 * @returns On success: when the mute would end
 * @note This function DOES update the database when it's called
 * @param userid Id of the user
 */
export function unmute(userid: string, member?: Discord.GuildMember) {
	const result = weakunmute(userid, member);
	if (result.ok)
		updateDb();
	return result;
}

/**
 * @returns A formatted string containing every mute in the database
 * @warning The output's length CAN be greater than 2000 chars (Discord's message's limit size)
 */
export function getMutes() {
	return mutes.reduce((acc: FormatedMute[], curr: Mute, index) =>
		(acc.push({
			user: `${curr.id}`,
			ends: curr.duration === -1 ? "nunca" : Common.dateOf(curr.time + curr.duration),
			begins: Common.dateOf(curr.time),
			duration: curr.duration === -1 ? "infinito" : Common.formatTime(curr.duration),
			reason: curr.reason
		}), acc), []);
}

/**
 * @returns If the user isn't muted, undefined. Otherwise, when the mute ends (-1 if permanent)
 * @param userid Id of the user
 */
export function isMuted(userid: string): number | undefined {
	for (const mute of mutes) {
		if (mute.id === userid)
			return mute.duration === -1 ? -1 : mute.time + mute.duration;
	}

	return undefined;
}

export function kick(user: string | Discord.GuildMember): Common.Result<undefined> {
	if (typeof user === "string") {
		const c = Common.client.guilds.cache.get(Common.SERVER.id)?.members.cache.get(user);
		if (c === undefined) {
			return { ok: false, error: "Membro desconhecido" };
		}

		user = c;
	}

	if (!user.kickable)
		return { ok: false, error: "Não posso kickar esse usuário" };

	user.kick().catch(Common.discordErrorHandler);

	return { ok: true, data: undefined };
}

export function ban(user: string | Discord.GuildMember, reason?: string): Common.Result<undefined> {
	if (typeof user === "string") {
		const c = Common.client.guilds.cache.get(Common.SERVER.id)?.members.cache.get(user);
		if (c === undefined) {
			return { ok: false, error: "Membro desconhecido" };
		}

		user = c;
	}

	if (!user.bannable)
		return { ok: false, error: "Não posso banir esse usuário" };

	user.ban({ reason }).catch(Common.discordErrorHandler);

	return { ok: true, data: undefined };
}

export function curseInvite(invite: string) {
	cursedInvites.push(invite);
}

export function uncurseInvite(invite: string) {
	cursedInvites = cursedInvites.filter(inv => inv !== invite);
}

type MessageWithHash = {
	hash: string;
	lastSent: number;
	channelsSet: Set<string>,
};

const knownMessages: MessageWithHash[] = [];
const knownMessagesByHash = new Map<string, MessageWithHash>();

setInterval(() => {
	const threshold = Date.now() - Common.TIME.minute;
	for (let i = 0; i < knownMessages.length; ++i) {
		const msg = knownMessages[i];

		if (msg.lastSent < threshold) {
			knownMessagesByHash.delete(msg.hash);
			knownMessages.splice(i, 1);
			i -= 1;
		}
	}
}, 1 * Common.TIME.second);

function isProbablyABotSpamming(message: Discord.Message<true>): boolean {
	const hash = crypto.hash("sha1", message.author.id + message.content);
	const now = Date.now();

	let knownMessage = knownMessagesByHash.get(hash);
	if (knownMessage) {
		if (knownMessage.channelsSet.size > 2) {
			return true;
		}

		knownMessage.channelsSet.add(message.channelId);
		knownMessage.lastSent = now;
	} else {
		knownMessage = {
			hash,
			lastSent: now,
			channelsSet: new Set([message.channelId]),
		};
		knownMessages.push(knownMessage);
		knownMessagesByHash.set(hash, knownMessage);
	}

	return false;
}
