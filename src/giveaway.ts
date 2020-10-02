import { Client, TextChannel, User } from "discord.js";
import { defaultErrorHandler, discordErrorHandler, Emojis } from "./defs";
import { collections, readCollection, writeCollection } from "./database";

export interface Giveaway {
	ends: number;
	qnt: number; // unsigned
	msg: string; // id
	prize: string;
}

export let channel: TextChannel;
export let giveaways: Giveaway[] = [];
export let scheduled: NodeJS.Timeout | undefined;

export async function init(client: Client) {
	client.channels.fetch("632359792010199104")
		.then(c => {
			if (c.type === "text") {
				channel = <TextChannel>c;
			}
		})
		.catch(discordErrorHandler);

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
	const message = await channel.messages.fetch(giveaway.msg).catch(discordErrorHandler);
	if (!message) return;

	const reaction = message.reactions.cache.get(Emojis.yes);
	if (!reaction) return;

	const users = await reaction.users.fetch().catch(discordErrorHandler);
	if (!users) return;

	const winners = users
		.filter(user => !user.bot)
		.random(giveaway.qnt)
		.reduce((acc, val) => acc + `\n${val}`, "");

	const text = `O sorteio acabou! Os seguintes usuários ganharam \`${giveaway.prize}\`:\n${winners}`;

	channel.send(text).catch(discordErrorHandler);

	scheduleGiveaway();
}

export function createGiveaway(msg: string, duration: number, qnt: number, prize: string) {
	giveaways.push({
		msg, qnt, prize,
		ends: Date.now() + duration
	});

	giveaways.sort((a, b) => a.ends - b.ends);

	updateDB();

	scheduleGiveaway();
}
