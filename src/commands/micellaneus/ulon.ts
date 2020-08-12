import { Command, Arguments, Server, Channels, Permission } from "../../defs";
import { Message } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments) {
		msg.channel.send(`ULO${'O'.repeat(Math.floor(Math.random() * 201))}N`);
	},
	syntaxes: [""],
	permissions: Permission.SHITPOST,
	aliases: ["ulon", "ul0n"],
	description: "ULOOOOON",
	help: "ULOOOOOOOOOOOOOOOOOON",
	examples: [`${Server.prefix}ulon`]
};