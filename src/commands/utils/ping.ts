import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[]) {
		const m = await msg.channel.send("...");
		m.edit(`\`Bot Latency:\` ${m.createdTimestamp - msg.createdTimestamp}ms\n\`API Latency:\` ${Math.round(msg.client.ws.ping)}ms`)
			.catch(Common.discordErrorHandler);
	},
	syntaxes: [""],
	permissions: Permission.NONE,
	aliases: ["ping", "pong"],
	description: "Ping!",
	help: "Pong!",
	examples: []
};