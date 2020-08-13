import { Command, Arguments, Server, Permission, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments) {
		msg.channel.send(`<@${msg.author}> https://github.com/oluigipo/obj_isaque`)
			.catch(discordErrorHandler);
	},
	syntaxes: [""],
	permissions: Permission.NONE,
	aliases: ["github", "repo"],
	description: "O link do meu repositório.",
	help: "O link do meu repositório.",
	examples: []
};