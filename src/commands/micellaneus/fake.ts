import { Command, Arguments, Permission, discordErrorHandler, Server } from "../../defs";
import { Message, GuildChannel, TextChannel } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (!(msg.member?.hasPermission("ADMINISTRATOR") || msg.author.id === "327576484396924929" /*id do gabe*/))
			return;

		if (msg.guild?.id === Server.id)
			msg.delete();

		const text = raw.slice(1).join(' ');
		const guild = msg.client.guilds.cache.get(Server.id);
		if (!guild)
			return;

		const _c = <TextChannel>msg.channel;
		const channel = guild.channels.cache.find(ch => ch.name === _c.name);

		if (!channel || (channel.type !== "text" && channel.type !== "news"))
			return;

		(<TextChannel>channel).send(text).catch(discordErrorHandler);
	},
	aliases: ["fake"],
	syntaxes: ["..."],
	description: "...",
	help: "...",
	examples: ["..."],
	permissions: Permission.NONE
}