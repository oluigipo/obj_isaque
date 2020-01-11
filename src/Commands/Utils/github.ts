import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		msg.channel.send(`${msg.author} https://github.com/Luig1B/obj_isaque`);
	},
	permissions: Permission.None,
	aliases: ["github", "repo"],
	shortHelp: "O link do meu repositório.",
	longHelp: "O link do meu repositório.",
	example: `${Server.prefix}github`
};