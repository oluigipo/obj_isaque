import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message<true>, args: Argument[]) {
		msg.channel.send(`${msg.author} https://github.com/oluigipo/obj_isaque`).catch(Common.discordErrorHandler);
	},
	syntaxes: [""],
	permissions: Permission.NONE,
	aliases: ["github", "repo"],
	description: "O link do meu repositório.",
	help: "O link do meu repositório.",
	examples: []
};