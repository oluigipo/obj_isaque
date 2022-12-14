import Discord from "discord.js";
import * as Common from "./common";

// NOTE(ljre): Types and globals
interface MessagesAndRoles {
	[messageId: string]: {
		emoji: string,
		role: string,
	}[] | undefined;
}

// NOTE(ljre): We need to fetch the channels we care about in order to receive events from them.
const channelsToFetch = [
	"517857905051959348", // regras-etc
];

const messagesAndRoles: MessagesAndRoles = {
	"743559874734063626": [
		{ emoji: "743241304405967020", role: "730818777998032967" },
		{ emoji: "556607844208869386", role: "630202297716178964" },
	],

	"771033656810274827": [
		{ emoji: "582605020340682773", role: "770691692986368050" },
	],
};

// NOTE(ljre): Events
export async function init() {
	for (const ch of channelsToFetch) {
		const channel = await Common.client.channels.fetch(ch);

		if (channel && channel.type === Discord.ChannelType.GuildText)
			await channel.messages.fetch({ limit: 50 });
	}
}

export async function done() {

}

export async function reactionAdd(reaction: Discord.MessageReaction, user: Discord.User) {
	const member = await reaction.message.guild?.members.fetch(user.id);
	if (!member)
		return;

	const data = messagesAndRoles[reaction.message.id];
	if (!data)
		return;

	for (const rec of data) {
		if (rec.emoji === reaction.emoji.id) {
			member.roles.add(rec.role).catch(Common.discordErrorHandler);
			return;
		}
	}
}

export async function reactionRemove(reaction: Discord.MessageReaction, user: Discord.User) {
	const member = await reaction.message.guild?.members.fetch(user.id);
	if (!member)
		return;

	const data = messagesAndRoles[reaction.message.id];
	if (!data)
		return;

	for (const rec of data) {
		if (rec.emoji === reaction.emoji.id) {
			member.roles.remove(rec.role).catch(Common.discordErrorHandler);
			return;
		}
	}
}
