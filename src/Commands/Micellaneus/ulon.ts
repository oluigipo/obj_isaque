import { Command, Arguments, Server, Channels, Permission } from "../../definitions";
import { Message } from "discord.js";
export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (msg.channel.id !== Channels.shitpost) return;
		msg.channel.send(`ULO${'O'.repeat(Math.floor(Math.random() * 201))}N`);
	},
	permissions: Permission.Shitpost,
	aliases: ["ulon"],
	shortHelp: "ULOOOOON",
	longHelp: "ULOOOOOOOOOOOOOOOOOON",
	example: `${Server.prefix}ulon`
};