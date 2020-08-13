import { Command, Arguments, Permission, discordErrorHandler, Server } from "../../defs";
import { Message, GuildChannel, TextChannel } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		const text = raw.slice(1).join(' ');
		const guild = msg.client.guilds.cache.get(Server.id);
		if (!guild)
			return;

		const _c = <TextChannel>msg.channel;
		const channel = guild.channels.cache.find(ch => ch.name === _c.name);

		if (!channel || channel.type !== "text")
			return;

		(<TextChannel>channel).send(text).catch(discordErrorHandler);
	},
	aliases: ["fake"],
	syntaxes: ["..."],
	description: "...",
	help: "...",
	examples: ["..."],
	permissions: Permission.DEV
}