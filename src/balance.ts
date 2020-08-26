import { collections } from "./database";
import { defaultErrorHandler, Response, Time, time, Channels } from "./defs";
import { Message, Guild } from "discord.js";

export enum Medal {
	NONE = 0,
	JAM_WINNER = 1,
	BOT_DEV = 2,
	STEAM = 4,
}

export interface User {
	id: string;
	money: number;
	description: string;
	messages: number;
	medals: Medal;
}

let users: User[] = [];

let stagedUpdate: NodeJS.Timeout | undefined;

const emptyUser = (id: string): User => ({
	id,
	money: 100,
	messages: 0,
	description: "*eu não sei mudar a descrição com o `!!desc`*",
	medals: Medal.NONE
});

const medalTable: { [key: string]: number | undefined } = {
	"jam": Medal.JAM_WINNER,
	"dev": Medal.BOT_DEV,
	"steam": Medal.STEAM
};

const Medals: { emoji: string, name: string }[] = [
	{ emoji: '', name: "Nenhuma medalha" },
	{ emoji: '🏅', name: "Vencedor da Jam" },
	{ emoji: '🛠️', name: "Contribuidor do bot" },
	{ emoji: '<:steam:748226826085859339>', name: "Publicou jogo na Steam" }
];

export const prayColldown = Time.hour * 22;

/**
 * Initializes everything.
 */
export async function init() {
	await loadDB();
}

/**
 * Loads the database.
 */
async function loadDB() {
	const db = collections.balance;
	const things = (await db.find({}).toArray())[0];
	users = things.users;
}

/**
 * Updates the database. Try to not call this function frequently.
 */
export async function updateDB() {
	if (stagedUpdate !== undefined) {
		clearTimeout(stagedUpdate);
		stagedUpdate = undefined;
	}

	const db = collections.balance;
	await db.findOneAndUpdate({}, { $set: { users } }, { projection: { _id: 0, users: 1 } })
		.catch(defaultErrorHandler);
}

/**
 * @note This function DOESN'T update the database when it's called.
 * @param userid User's id
 */
export function weakCreateUser(userid: string): Response {
	const index = users.findIndex(u => u.id === userid);
	if (index !== -1)
		return { success: false, error: "usuário/você já está registrado" };

	users.push(emptyUser(userid));

	return { success: true, data: undefined };
}

/**
 * @note This function DOES update the database when it's called.
 * @param userid User's id
 */
export function createUser(userid: string): Response {
	const result = weakCreateUser(userid);
	if (result.success)
		updateDB();
	return result;
}

/**
 * @returns An copy of the user.
 * @param userid User's id
 */
export function userData(userid: string): Response<User> {
	const index = users.findIndex(u => u.id === userid);
	if (index === -1)
		return { success: false, error: "usuário/você não está registrado" };
	return { success: true, data: { ...users[index] } };
}

/**
 * @returns Top 9 members of a page.
 * @param page The page number. This value should be >= 0.
 */
export function richest(page: number): User[] {
	return users.sort((u1, u2) => u1.money - u2.money).slice(page * 9, 9);
}

export function giveMedal(userid: string, medal: string): Response {
	const index = users.findIndex(u => u.id === userid);
	if (index === -1) {
		return { success: false, error: "usuário/você não está registrado" };
	}

	const user = users[index];
	const m = medalTable[medal];

	if (!m) {
		return { success: false, error: "medalha não existe" };
	}

	user.medals |= m;
	updateDB();

	return { success: true, data: void 0 };
}

export function removeMedal(userid: string, medal: string): Response {
	const index = users.findIndex(u => u.id === userid);
	if (index === -1) {
		return { success: false, error: "usuário/você não está registrado" };
	}

	const user = users[index];
	const m = medalTable[medal];

	if (!m) {
		return { success: false, error: "medalha não existe" };
	}

	user.medals &= ~m;
	updateDB();

	return { success: true, data: void 0 };
}

export function medals(m: Medal) {
	let result = <{ emoji: string, name: string }[]>[];

	for (let i = 1; i < Medals.length; i++) {
		if ((m >> (i - 1)) & 1)
			result.push(Medals[i]);
	}

	if (result.length === 0)
		result[0] = Medals[0];

	return result;
}

export function resetAll() {
	users = [];
	updateDB();
}

export function changeDesc(userid: string, desc: string): Response {
	const index = users.findIndex(u => u.id === userid);
	if (index === -1) {
		return { success: false, error: "usuário/você não está registrado" };
	}

	users[index].description = desc;
	updateDB();
	return { success: true, data: void 0 };
}

export function onMessage(msg: Message) {
	if (Channels.shitpost.includes(<string>msg.guild?.id))
		return;

	const index = users.findIndex(u => u.id === msg.author.id);
	if (index === -1) {
		return;
	}

	if (++users[index].messages >= 100) {
		users[index].messages = 0;
		users[index].money += 50;

		if (stagedUpdate === undefined)
			stagedUpdate = setTimeout(updateDB, Time.minute * 5);
	}
}