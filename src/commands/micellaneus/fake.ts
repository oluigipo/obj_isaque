import { Command, Argument, Permission, ValidChannel, validChannelTypes } from "../index";
import Discord from "discord.js";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Discord.Message, args: Argument[], raw: string[]) {
		if (!(msg.member?.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) || msg.author.id === "327576484396924929" /*id do gabe*/))
			return;

		if (msg.guild?.id === Common.SERVER.id)
			msg.delete();

		const text = raw.slice(1).join(' ');
		const guild = msg.client.guilds.cache.get(Common.SERVER.id);
		if (!guild)
			return;

		const _c = <ValidChannel>msg.channel;
		const channel = guild.channels.cache.find(ch => ch.name === _c.name);

		if (channel && validChannelTypes.includes(channel.type))
			(<ValidChannel>channel).send(text).catch(Common.discordErrorHandler);
	},
	aliases: ["fake"],
	syntaxes: ["..."],
	description: "...",
	help: "...",
	examples: ["..."],
	permissions: Permission.NONE
}