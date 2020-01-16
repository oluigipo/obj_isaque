import { Command, Arguments, Server, Permission, CommonMessages, Emojis } from "../../definitions";
import { Message } from "discord.js";
import { emojis, userCreate } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 4) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} ${CommonMessages.syntaxError}`);
			return;
		}

		const emoji = args[2];
		if (emojis.indexOf(emoji) === -1) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} Este emoji não é válido! Se quiser saber os emojis permitidos, use \`\
			${Server.prefix}shop emojis\``);
			return;
		}

		const name = args.slice(3).join(' ');
		const result = userCreate(msg.author.id, emoji, name);

		if (!result.success) {
			msg.channel.send(result.reason.replace('#', `${msg.author}`));
			return;
		}

		msg.channel.send(`${Emojis.yes} **|** ${msg.author} Parabéns, você acabou de abrir a lojinha **${name}** que vende ${emoji}!`);
	},
	permissions: Permission.None,
	aliases: ["create", "novo", "make"],
	shortHelp: "Inicie a sua lojinha!",
	longHelp: "Inicie agora a sua lojinha!",
	example: `${Server.prefix}shop create emoji nome`
};