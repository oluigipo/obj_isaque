import { Command, Arguments, Server, Permission, Emojis, CommonMessages } from "../../definitions";
import { Message } from "discord.js";
import { userRename } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 3) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} ${CommonMessages.syntaxError}`);
			return;
		}

		const name = args.slice(2).join(' ');
		const result = userRename(msg.author.id, name);

		if (!result.success) msg.channel.send(result.reason.replace('#', `${msg.author}`));
		else msg.channel.send(`${Emojis.yes} **|** ${msg.author} O nome da sua lojinha foi alterado para **${name}**!`);
	},
	permissions: Permission.None,
	aliases: ["rename"],
	shortHelp: "Renomeie sua lojinha!",
	longHelp: "Renomeie sua lojinha!",
	example: `${Server.prefix}shop rename novoNome`
};