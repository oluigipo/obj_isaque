import { Command, Arguments, Server, Permission, CommonMessages, Emojis } from "../../definitions";
import { Message } from "discord.js";
import { companyRename } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 3) {
			msg.channel.send(`${msg.author} ${CommonMessages.syntaxError}`);
			return;
		}

		const name = args.slice(2).join(' ');
		const result = companyRename(msg.author.id, name);

		if (!result.success) msg.channel.send(result.reason);
		else msg.channel.send(`${Emojis.yes} **|** ${msg.author} Você acaba de renomar sua empresa para **${name}**!`);
	},
	permissions: Permission.None,
	aliases: ["crename"],
	shortHelp: "Renomeie sua empresa!",
	longHelp: "Renomeie sua empresa! É necessário ser dono para usar esse comando!",
	example: `${Server.prefix}shop crename novoNome`
};