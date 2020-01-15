import { Command, Arguments, Server, Permission, Emojis } from "../../definitions";
import { Message } from "discord.js";
import { userWork } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		const res = userWork(msg.author.id);

		if (!res.success) msg.channel.send(res.reason);
		else msg.channel.send(`💵 Você trabalhou e recebeu \`$${res.extra}\`!`);
	},
	permissions: Permission.None,
	aliases: ["work", "trabalhar", "w"],
	shortHelp: "Trabalhe em sua loja e ganhe dinheiro!",
	longHelp: "Trabalhe em sua loja e ganhe dinheiro! Você só pode trabalhar a cada 5 minutos, pois todo mundo precisa de um tempo para descançar.",
	example: `${Server.prefix}shop work`
};