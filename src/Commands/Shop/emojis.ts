import { Command, Arguments, Server, Permission, Emojis } from "../../definitions";
import { Message } from "discord.js";
import { emojis, userChangeEmoji } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length === 2) {
			msg.channel.send(`${msg.author} Estes são os emojis permitidos: ${emojis.join('')}`);
			return;
		}

		const res = userChangeEmoji(msg.author.id, args[2]);

		if (!res.success) msg.channel.send(res.reason.replace('#', `${msg.author}`));
		else msg.channel.send(`${Emojis.yes} **|** ${msg.author} Emoji alterado para ${args[2]}!`);
	},
	permissions: Permission.Shitpost,
	aliases: ["emojis", "emoji"],
	shortHelp: "Veja os emojis permitidos para usar como produto na sua lojinha ou altere o seu emoji atual.",
	longHelp: "Veja os emojis permitidos para usar como produto na sua lojinha ou altere o seu emoji atual.",
	example: `${Server.prefix}shop emojis\n${Server.prefix}shop emoji novoEmoji`
};