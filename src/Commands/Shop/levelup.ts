import { Command, Arguments, Server, Permission, Emojis } from "../../definitions";
import { Message } from "discord.js";
import { companyLevelUp } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		const result = companyLevelUp(msg.author.id);

		if (!result.success) msg.channel.send(result.reason);
		else msg.channel.send(`${Emojis.yes} **|** ${msg.author} Você melhorou sua empresa para o nível **${result.extra}**!`);
	},
	permissions: Permission.None,
	aliases: ["levelup"],
	shortHelp: "Dê upgrade na sua empresa!",
	longHelp: "Dê upgrade na sua empresa! Isto aumentará o nível dela. Este comando só pode ser usado pelo dono da empresa.",
	example: `${Server.prefix}shop levelup`
};