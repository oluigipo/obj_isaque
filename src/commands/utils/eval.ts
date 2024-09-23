import { Command, Argument, Permission } from "../index";
import * as Common from "../../common";
import * as Moderation from "../../moderation";
import * as Balance from "../../balance";
import * as Giveaway from "../../giveaway";
import { Message } from "discord.js";

export default <Command>{
	async run(msg: Message<true>, args: Argument[], raw: string[]) {
		const expr = raw.slice(1).join(' ');

		// @NOTE(luigi): don't remove.
		// Typescript will remove those imports if they are not used.
		Common;
		Moderation;
		Balance;
		Giveaway;

		let result: any;
		try {
			result = String(eval(expr));
		} catch (e) {
			result = String(e);
		}

		msg.channel.send(result).catch(Common.discordErrorHandler);
	},
	aliases: ["eval"],
	syntaxes: ["expr"],
	description: "eval do javascript",
	help: "por que quer saber?",
	examples: ["process.exit(1)"],
	permissions: Permission.DEV
}