import { Command, Arguments, Server, Permission, Emojis, CommonMessages } from "../../definitions";
import { Message } from "discord.js";
import { companyApply } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 3) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} ${CommonMessages.syntaxError}`);
			return;
		}

		const value = parseInt(args[2], 10);
		if (isNaN(value) || value < 0) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} Valor inválido!`);
			return;
		}

		const result = companyApply(msg.author.id, value);

		if (!result.success) msg.channel.send(result.reason);
		else msg.channel.send(`${Emojis.yes} **|** ${msg.author} Você investiu \`$${value}\` em sua empresa!`);
	},
	permissions: Permission.None,
	aliases: ["apply", "a"],
	shortHelp: "Invista dinheiro na sua empresa!",
	longHelp: "Invista dinheiro na sua empresa! Ao fazer isso, você estará aumentando o saldo da sua empresa. Quando sua empresa tiver dinheiro o suficiente, ela pode subir de nível!",
	example: `${Server.prefix}shop apply quantidade`
};