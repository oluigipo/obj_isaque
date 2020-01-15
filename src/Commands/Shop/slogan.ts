import { Command, Arguments, Server, Permission, Emojis } from "../../definitions";
import { Message } from "discord.js";
import { getUser, updateUser } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		const u = getUser(msg.author.id);
		if (u === void 0) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} Você não tem uma lojinha!`);
			return;
		}

		if (args.length < 3) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} Escolha um slogan! Veja a sintaxe: \`${Server.prefix}shop slogan [seu slogan]\``);
			return;
		}

		const text = args.slice(2).join(' ');
		u.slogan = text;

		updateUser(u);

		msg.channel.send(`${Emojis.yes} **|** ${msg.author} Seu slogan foi alterado com sucesso!`);
	},
	permissions: Permission.None,
	aliases: ["slogan"],
	shortHelp: "Mude o slogan da sua loja!",
	longHelp: "Mude o slogan da sua loja!",
	example: `${Server.prefix}shop slogan Quanto mais, melhor!`
};