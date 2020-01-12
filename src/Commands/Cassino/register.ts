import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";
import { Bank } from "../../Cassino";

export default <Command>{
	run: (msg: Message, args: Arguments) => {
		const result = Bank.register(msg.author.id);
		if (result) {
			msg.channel.send(`${msg.author} Você foi registrado com sucesso!`);
		} else {
			msg.channel.send(`${msg.author} Você já está registrado!`);
		}
	},
	permissions: Permission.Shitpost | Permission.Cassino,
	aliases: ["register", "registrar"],
	shortHelp: "Te registra no Banco",
	longHelp: "Com este comando, você irá se registrar no Banco do servidor. Este é o primeiro passo para participar de eventos como a loteria, corrida de cavalos, etc",
	example: `${Server.prefix}register`
};