import Discord from "discord.js";
import { REST } from "@discordjs/rest";
import * as Common from "./common";
import * as Commands from "./commands";
import * as Database from "./database";

// NOTE(ljre): Events
export interface Giveaway {
	ends: number;
	qnt: number; // unsigned
	msg: string; // id
	prize: string;
	role?: string; // id
	channel?: string; // id
}

export let giveaways: Giveaway[] = [];
export let scheduled: NodeJS.Timeout | undefined;

// NOTE(ljre): Events
export async function init() {
	await loadDB();
	scheduleGiveaway();
}

export async function done() {
	await updateDB();
}

// NOTE(ljre): Functions
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
	giveaways = await Database.readCollection("balance", "giveaways");
}

async function updateDB() {
	await Database.writeCollection("balance", "giveaways", giveaways);
}

async function execGiveaway(giveaway: Giveaway) {
	const tmpChannel = await Common.client.channels.fetch(giveaway.channel ?? "632359792010199104").catch(Common.discordErrorHandler);
	if (!tmpChannel || Commands.validChannelTypes.includes(tmpChannel.type))
		return;

	const channel = <Discord.TextChannel>tmpChannel;
	const message = await channel.messages.fetch(giveaway.msg).catch(Common.discordErrorHandler);
	if (!message)
		return;

	const reaction = message.reactions.cache.get(Common.EMOJIS.yes);
	if (!reaction)
		return;

	const users = await reaction.users.fetch().catch(Common.discordErrorHandler);
	if (!users)
		return;

	let member: Discord.GuildMember | undefined;
	const winners = users
		.filter(user => !user.bot && (member = channel.members.get(user.id), member !== void 0 && member.roles.cache.has(giveaway.role ?? Common.ROLES.community)))
		.random(giveaway.qnt)
		.filter(user => user !== undefined) // why tf does .random add padding undefined????
		;

	if (winners.length > 0) {
		let text = `O sorteio acabou! Os seguintes usuários ganharam \`${giveaway.prize}\`:\n${winners.reduce((acc, val) => acc + `\n${val}`, "")}`;

		if (giveaway.qnt > winners.length)
			text += `\n\nMas ainda sobrou ${giveaway.qnt - winners.length} prêmio(s)!`;

		channel.send(text).catch(Common.discordErrorHandler);
	} else {
		channel.send("Poxa, ninguém ganhou :pensive:").catch(Common.discordErrorHandler);
	}

	scheduleGiveaway();
}

// NOTE(ljre): API
export function createGiveaway(msg: string, duration: number, qnt: number, prize: string, role?: string, channel?: string) {
	giveaways.push({
		msg, qnt, prize, role, channel,
		ends: Date.now() + duration
	});

	giveaways.sort((a, b) => a.ends - b.ends);

	updateDB();

	scheduleGiveaway();
}