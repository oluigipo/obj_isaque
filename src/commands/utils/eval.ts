import { Command, Arguments, Permission, discordErrorHandler } from "../../defs";
import * as Defs from "../../defs";
import { Message } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		const expr = raw.slice(1).join(' ');

		// @NOTE(luigi): don't remove.
		// Typescript will optimize and remove import
		Defs;

		let result: any;
		try {
			result = String(eval(expr));
		} catch (e) {
			result = String(e);
		}

		msg.channel.send(result).catch(discordErrorHandler);
	},
	aliases: ["eval"],
	syntaxes: ["expr"],
	description: "eval do javascript",
	help: "por que quer saber?",
	examples: ["process.exit(1)"],
	permissions: Permission.DEV
}