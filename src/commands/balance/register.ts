import { Command, Arguments, Permission, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";
import * as Balance from "../../balance";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		const result = Balance.createUser(msg.author.id);

		if (result.success) {
			msg.reply("registrado! Seja bem-vindo(a) ao novo banco")
				.catch(discordErrorHandler);
		} else {
			msg.reply(result.error).catch(discordErrorHandler);
		}
	},
	aliases: ["register", "registrar"],
	syntaxes: [""],
	description: "Cria uma nova conta no novo banco.",
	help: "Cria uma nova conta no novo banco. Você começa com $100.",
	examples: [""],
	permissions: Permission.SHITPOST
}