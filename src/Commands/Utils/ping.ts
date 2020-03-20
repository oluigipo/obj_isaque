import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";

export default <Command>{
	run: async (msg: Message, args: Arguments) => {
		const m = await msg.channel.send("...");
		m.edit(`\`Bot Latency:\` ${m.createdTimestamp - msg.createdTimestamp}ms\n\`API Latency:\` ${Math.round(msg.client.ping)}ms`);
	},
	permissions: Permission.None,
	aliases: ["ping", "pong"],
	shortHelp: "Ping!",
	longHelp: "Pong!",
	example: `${Server.prefix}ping`
};