import { Command, Arguments, Permission } from "../../defs";
import { Message } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		msg.reply("não implementado ainda");
	},
	aliases: ["help", "ajuda"],
	syntaxes: ["", "<comando> <subcomando...>"],
	description: "Informações sobre os comandos.",
	help: "HEEEEEEELP I NEED SOMEBODY",
	examples: ["lisp", "help"],
	permissions: Permission.NONE
}