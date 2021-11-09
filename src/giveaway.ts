import { Client, GuildMember, TextChannel, User } from "discord.js";
import { defaultErrorHandler, discordErrorHandler, Emojis, Roles } from "./defs";
import { collections, readCollection, writeCollection } from "./database";

export interface Giveaway {
	ends: number;
	qnt: number; // unsigned
	msg: string; // id
	prize: string;
	role?: string; // id
	channel?: string; // id
}

export let client: Client;
export let giveaways: Giveaway[] = [];
export let scheduled: NodeJS.Timeout | undefined;

export async function init(_client: Client) {
	client = _client;

	await loadDB();

	scheduleGiveaway();
}

function scheduleGiveaway() {
	if (giveaways.length > 0) {
		if (scheduled)
			clearTimeout(scheduled);

		scheduled = setTimeout(async () => {
			const giveaway = giveaways[0];
			giveaways.shift();

			await execGiveaway(giveaway);
			await updateDB();
		}, giveaways[0].ends - Date.now());
	} else {
		scheduled = undefined;
	}
}

async function loadDB() {
	giveaways = await readCollection("balance", "giveaways");
}

async function updateDB() {
	writeCollection("balance", "giveaways", giveaways);
}

async function execGiveaway(giveaway: Giveaway) {
	const tmpChannel = await client.channels.fetch(giveaway.channel ?? "632359792010199104").catch(discordErrorHandler);
	if (!tmpChannel || tmpChannel.type !== "text") return;

	const channel = <TextChannel>tmpChannel;
	const message = await channel.messages.fetch(giveaway.msg).catch(discordErrorHandler);
	if (!message) return;

	const reaction = message.reactions.cache.get(Emojis.yes);
	if (!reaction) return;

	const users = await reaction.users.fetch().catch(discordErrorHandler);
	if (!users) return;

	let member: GuildMember | undefined;
	const winners = users
		.filter(user => !user.bot && (member = channel.members.get(user.id), member !== void 0 && member.roles.cache.has(giveaway.role ?? Roles.community)))
		.random(giveaway.qnt)
		.filter(user => user !== undefined) // why tf does .random add padding undefined????
		;

	if (winners.length > 0) {
		let text = `O sorteio acabou! Os seguintes usuários ganharam \`${giveaway.prize}\`:\n${winners.reduce((acc, val) => acc + `\n${val}`, "")}`;

		if (giveaway.qnt > winners.length)
			text += `\n\nMas ainda sobrou ${giveaway.qnt - winners.length} prêmio(s)!`;

		channel.send(text).catch(discordErrorHandler);
	} else {
		channel.send("Poxa, ninguém ganhou :pensive:");
	}

	scheduleGiveaway();
}

export function createGiveaway(msg: string, duration: number, qnt: number, prize: string, role?: string, channel?: string) {
	giveaways.push({
		msg, qnt, prize, role, channel,
		ends: Date.now() + duration
	});

	giveaways.sort((a, b) => a.ends - b.ends);

	updateDB();

	scheduleGiveaway();
}
