import { Client, Message, MessageReaction, PartialUser, TextChannel, User } from "discord.js";
import * as Database from "./database";
import { Channels, Emojis, Permission, Time, validatePermissions } from "./defs";

let usersList: { [key: string]: number };

export async function init(client: Client) {
	usersList = await Database.readCollection("balance", "steam_reviews");

	const ch = await client.channels.fetch(Channels.steamReviews);
	if (ch.type !== "text")
		return;

	const channel = <TextChannel>ch;
	const messages = await channel.messages.fetch();

	messages.forEach(async msg => {
		if (msg.pinned)
			return;

		if (msg.reactions.cache.size > 0) {

			async function checkForEmoji(emoji: string, f: () => boolean) {
				const reaction = msg.reactions.cache.get(emoji);
				if (reaction) {
					let users = await reaction.users.fetch();
					users = users.filter((_, key) => key !== client.user?.id);

					for (const [uid, u] of users) {
						const member = channel.guild.members.cache.get(uid);
						if (!member)
							return false;

						if (validatePermissions(member, channel, Permission.MOD)) {
							if (!f()) return true;
						}
					}
				}

				return false;
			}

			if (!await checkForEmoji(Emojis.yes, () => (pointTo(msg.author.id), msg.delete(), false))) {
				await checkForEmoji(Emojis.no, () => (msg.delete(), false));
			}

		} else {
			onMessage(msg);
		}
	});

	update();
}

export function update() {
	Database.writeCollection("balance", "steam_reviews", usersList);
}

export function reset() {
	usersList = {};
	update();
}

export function pickRandom() {
	let finalArray = <string[]>[];
	const keys = Object.keys(usersList);
	if (keys.length === 0)
		return "";

	for (const key of keys) {
		let arr = new Array<string>(usersList[key]).fill(key);
		finalArray.push(...arr);
	}

	const index = Math.floor(Math.random() * finalArray.length);
	return finalArray[index];
}

export function pointTo(userid: string) {
	usersList[userid] = Math.min((usersList[userid] ?? 0) + 1, 3);
}

export async function onMessage(msg: Message) {
	if (msg.channel.id !== Channels.steamReviews || msg.pinned)
		return;

	await msg.react(Emojis.yes);
	await msg.react(Emojis.no);
}

export async function onReactionAdded(reaction: MessageReaction, user: User | PartialUser) {
	const member = reaction.message.guild?.members.cache.get(user.id);
	if (!member || reaction.message.channel.type === "dm" || user.bot || reaction.message.pinned)
		return;

	if (!(validatePermissions(member, reaction.message.channel, Permission.MOD) || member.id === "327576484396924929" /* id do gabe */))
		return;

	switch (reaction.emoji.id ?? reaction.emoji.name) {
		case Emojis.yes:
			pointTo(reaction.message.author.id);
			update();
		case Emojis.no:
			reaction.message.delete();
			break;
	}
}
