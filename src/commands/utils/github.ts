import { Command, Arguments, Server, Permission } from "../../defs";
import { Message } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments) {
		msg.channel.send(`${msg.author} https://github.com/Luig1B/obj_isaque`);
	},
	syntaxes: [""],
	permissions: Permission.NONE,
	aliases: ["github", "repo"],
	description: "O link do meu repositório.",
	help: "O link do meu repositório.",
	examples: [`${Server.prefix}github`]
};