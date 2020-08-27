import { collections } from "./database";
import { defaultErrorHandler, Response, Time, Channels, Server } from "./defs";
import { Message, Guild, GuildMemberRoleManager, Client } from "discord.js";

export enum Medal {
	NONE = 0,
	JAM_WINNER = 1,
	BOT_DEV = 2,
	STEAM = 4,
	CURSO = 8, // terminou o curso
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
	"steam": Medal.STEAM,
	"curso": Medal.CURSO
};

export const Medals: { emoji: string, name: string }[] = [
	{ emoji: '', name: "Nenhuma medalha" },
	{ emoji: '🏅', name: "Vencedor da Jam" },
	{ emoji: '🛠️', name: "Contribuidor do bot" },
	{ emoji: '<:steam:748226826085859339>', name: "Publicou jogo na Steam" },
	{ emoji: '<:capitao_none:582605020340682773>', name: "Terminou o Curso" }
];

const Levels = ["748343273852108915", "748342968099930204", "748341527264362516"];
const LevelMul = [4, 2, 1.5];

export const prayColldown = Time.hour * 22;

let client: Client;

/**
 * Initializes everything.
 */
export async function init(c: Client) {
	client = c;
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
 * @param qnt The size of a page.
 */
export function richest(page: number, qnt: number): User[] {
	return users.sort((u1, u2) => u2.money - u1.money).slice(page * qnt, (page + 1) * qnt);
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

// export function resetAll() {
// 	users = [];
// 	updateDB();
// }

export function changeDesc(userid: string, desc: string): Response {
	const index = users.findIndex(u => u.id === userid);
	if (index === -1) {
		return { success: false, error: "usuário/você não está registrado" };
	}

	users[index].description = desc;
	updateDB();
	return { success: true, data: void 0 };
}

export function prize(usersids: string[], qnt: number, mult = true): Response<number>[] {
	let success = <Response<number>[]>[];

	for (let i = 0; i < usersids.length; i++) {
		const userid = usersids[i];
		const index = users.findIndex(u => u.id === userid);
		if (index === -1) {
			success[i] = { success: false, error: "usuário não está registrado" };
			continue;
		}

		success[i] = { success: true, data: (users[index].money += qnt * (mult ? multiplierOf(userid) : 1)) };
	}

	updateDB();
	return success;
}

export function buy(userid: string, qnt: number, zero = false): Response<boolean> {
	const index = users.findIndex(u => u.id === userid);
	if (index === -1) {
		return { success: false, error: "usuário/você não está registrado" };
	}

	const user = users[index];
	if (user.money < qnt) {
		if (zero) user.money = 0;
		return { success: true, data: false };
	}

	user.money -= qnt;
	return { success: true, data: true };
}

export function multiplierOf(roles?: GuildMemberRoleManager | string): number {
	if (typeof roles === "string") {
		roles = client.guilds.cache.get(Server.id)?.members.cache.get(roles)?.roles;
	}

	if (!roles)
		return 1;

	for (let i = 0; i < Levels.length; i++) {
		if (roles.cache.has(Levels[i]))
			return LevelMul[i];
	}

	return 1;
}

export function transfer(id1: string, id2: string, qnt: number): Response<undefined> {
	const index1 = users.findIndex(u => u.id === id1);
	const index2 = users.findIndex(u => u.id === id2);

	if (index1 === -1 || index2 === -1) {
		return { success: false, error: "usuário/você não está registrado" };
	}

	if (users[index1].money < qnt) {
		return { success: false, error: "usuário/você não tem dinheiro o suficiente para a transferência" };
	}

	users[index1].money -= qnt;
	users[index2].money += qnt;
	updateDB();

	return { success: true, data: void 0 };
}

export const userCount = () => users.length;

export function onMessage(msg: Message) {
	if (msg.guild?.id !== Server.id || Channels.shitpost.includes(<string>msg.channel?.id))
		return;

	const index = users.findIndex(u => u.id === msg.author.id);
	if (index === -1) {
		return;
	}

	if (++users[index].messages >= 100) {
		users[index].messages = 0;
		users[index].money += 50 * multiplierOf(msg.member?.roles);

		if (stagedUpdate === undefined)
			stagedUpdate = setTimeout(updateDB, Time.minute * 5);
	}
}

export async function onExit() {
	if (stagedUpdate !== undefined) {
		clearTimeout(stagedUpdate);
		await updateDB();
	}
}