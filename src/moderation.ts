import { Response, defaultErrorHandler, Roles, discordErrorHandler, Server, Time, dateOf } from "./defs";
import { Client, GuildMember } from "discord.js";
import { collections } from "./database";

interface Mute {
	id: string;
	time: number;
	duration: number;
}

export type Mutes = Mute[];

let mutes: Mutes;
let client: Client;

export async function init(c: Client) {
	client = c;
	await loadDB();
	setTimeout(autoUnmute, Time.minute);
}

export function autoUnmute() {
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
		updateDB();
	setTimeout(autoUnmute, Time.minute);
}

async function loadDB() {
	// @NOTE(luigi): proper database communication
	const db = collections.mutes;
	mutes = (await db.find({}).toArray())[0].mutes;
}

export function updateDB() {
	// @NOTE(luigi): proper database communication

	const db = collections.mutes;
	db.findOneAndUpdate({}, { $set: { mutes } }, { projection: { _id: 0, mutes: 1 } })
		.catch(defaultErrorHandler);
}

/**
 * @returns On success: when the mute ends
 * @note This function DOESN'T update the database when it's called
 * @param userid Id of the user
 * @param duration Mute duration. -1 if undefined
 */
export function weakmute(userid: string, duration: number = -1, member?: GuildMember): Response<number> {
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
		const c = client.guilds.cache.get(Server.id)?.members.cache.get(userid);

		if (c === undefined) {
			return { success: false, error: "Membro desconhecido" }
		}

		member = c;
	}

	member.roles.add(Roles.muted).catch(discordErrorHandler);

	const now = Date.now();
	mutes[index] = { id: userid, time: now, duration };
	updateDB();
	return { success: true, data: now + duration, warning };
}

/**
 * @returns On success: when the mute ends
 * @note This function DOES update the database when it's called
 * @param userid Id of the user
 * @param duration Mute duration. -1 if undefined
 */
export function mute(userid: string, duration: number = -1, member?: GuildMember) {
	const result = weakmute(userid, duration, member);
	if (result.success)
		updateDB();
	return result;
}

/**
 * @returns On success: when the mute would end
 * @note This function DOESN'T update the database when it's called
 * @param userid Id of the user
 */
export function weakunmute(userid: string, member?: GuildMember): Response<number> {
	for (let i = 0; i < mutes.length; ++i)
		if (mutes[i].id === userid) {
			const mute = mutes[i];

			mutes = mutes.filter((_, index) => index !== i);

			if (!member) {
				const c = client.guilds.cache.get(Server.id)?.members.cache.get(userid);

				if (c === undefined) {
					return { success: false, error: "Membro desconhecido" }
				}

				member = c;
			}

			member.roles.remove(Roles.muted).catch(discordErrorHandler);

			return { success: true, data: mute.time + mute.duration };
		}

	return { success: false, error: "Esse usuário não está mutado." };
}

/**
 * @returns On success: when the mute would end
 * @note This function DOES update the database when it's called
 * @param userid Id of the user
 */
export function unmute(userid: string, member?: GuildMember) {
	const result = weakunmute(userid, member);
	if (result.success)
		updateDB();
	return result;
}

/**
 * @returns A formatted string containing every mute in the database
 * @warning The output's length CAN be greater than 2000 chars (Discord's message's limit size)
 */
export function formatedMuteList() {
	return mutes.reduce((acc: string, curr: Mute, index) =>
		acc + `${index + 1} - <@${curr.id}> acaba \`${curr.duration === -1 ? "nunca" : dateOf(curr.time + curr.duration)}\`\n`,
		""
	);
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

export function kick(user: string | GuildMember): Response<undefined> {
	if (typeof user === "string") {
		const c = client.guilds.cache.get(Server.id)?.members.cache.get(user);
		if (c === undefined) {
			return { success: false, error: "Membro desconhecido" }
		}

		user = c;
	}

	if (!user.kickable)
		return { success: false, error: "Não posso kickar esse usuário" };

	user.kick().catch(discordErrorHandler);

	return { success: true, data: undefined };
}

export function ban(user: string | GuildMember): Response<undefined> {
	if (typeof user === "string") {
		const c = client.guilds.cache.get(Server.id)?.members.cache.get(user);
		if (c === undefined) {
			return { success: false, error: "Membro desconhecido" }
		}

		user = c;
	}

	if (!user.bannable)
		return { success: false, error: "Não posso banir esse usuário" };

	user.ban().catch(discordErrorHandler);

	return { success: true, data: undefined };
}