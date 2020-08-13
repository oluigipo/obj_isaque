import { Command, Arguments, Permission } from "../../defs";
import { Message } from "discord.js";
import * as cmds from "../index";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		msg.reply("não implementado ainda");

		// @TODO(luigi): help command
	},
	aliases: ["help", "ajuda"],
	syntaxes: ["", "<comando> <subcomando...>"],
	description: "Informações sobre os comandos.",
	help: "HEEEEEEELP I NEED SOMEBODY",
	examples: ["help", "mute", "lisp"],
	permissions: Permission.NONE
}