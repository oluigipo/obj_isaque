import { Command, Arguments, Server, Permission } from "../../defs";
import { Message } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments) {
		const m = await msg.channel.send("...");
		m.edit(`\`Bot Latency:\` ${m.createdTimestamp - msg.createdTimestamp}ms\n\`API Latency:\` ${Math.round(msg.client.ws.ping)}ms`);
	},
	syntaxes: [""],
	permissions: Permission.NONE,
	aliases: ["ping", "pong"],
	description: "Ping!",
	help: "Pong!",
	examples: [`${Server.prefix}ping`]
};