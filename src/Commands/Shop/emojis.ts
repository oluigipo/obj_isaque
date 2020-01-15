import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";
import { emojis } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		msg.channel.send(`${msg.author} Estes são os emojis permitidos: ${emojis}`);
	},
	permissions: Permission.Shitpost,
	aliases: ["emojis", "emoji"],
	shortHelp: "Veja os emojis permitidos para usar como produto na sua lojinha.",
	longHelp: "Veja os emojis permitidos para usar como produto na sua lojinha.",
	example: `${Server.prefix}shop emojis`
};