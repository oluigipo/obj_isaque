import { Command, Arguments, Server, Permission, Emojis } from "../../definitions";
import { Message } from "discord.js";
import { companyDeny } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		const result = companyDeny(msg.author.id);

		if (!result.success) msg.channel.send(result.reason.replace('#', `${msg.author}`));
		else msg.channel.send(`${Emojis.yes} **|** ${msg.author} Você recusou o convite de **${result.extra}**!`);
	},
	permissions: Permission.None,
	aliases: ["deny", "recusar"],
	shortHelp: "Recuse um convite de uma empresa!",
	longHelp: "Recuse um convite de uma empresa!",
	example: `${Server.prefix}shop deny`
};