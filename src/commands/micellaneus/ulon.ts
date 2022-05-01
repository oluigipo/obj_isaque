import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[]) {
		msg.channel.send(`ULO${'O'.repeat(Math.floor(Math.random() * 201))}N`)
			.catch(Common.discordErrorHandler);
	},
	syntaxes: [""],
	permissions: Permission.SHITPOST,
	aliases: ["ulon", "ul0n"],
	description: "ULOOOOON",
	help: "ULOOOOOOOOOOOOOOOOOON",
	examples: []
};