import { Command, Arguments, Server, Permission, Emojis } from "../../definitions";
import { Message } from "discord.js";
import { companyJoin } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		const result = companyJoin(msg.author.id);

		if (!result.success) msg.channel.send(result.reason);
		else msg.channel.send(`${Emojis.yes} **|** ${msg.author} Parabéns, você entrou na **${result.extra}**!`);
	},
	permissions: Permission.None,
	aliases: ["join"],
	shortHelp: "Aceita um convite para uma empresa!",
	longHelp: "Aceita um convite para uma empresa! Para convidar, use `" + Server.prefix + "shop invite @user`",
	example: `${Server.prefix}shop join`
};