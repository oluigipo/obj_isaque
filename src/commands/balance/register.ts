import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Balance from "../../balance";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (!msg.member?.roles.cache.has(Common.ROLES.community))
			return msg.reply("você precisa ter o cargo Community para se registrar. Dê uma olhada no <#517857905051959348>")
				.catch(Common.discordErrorHandler);

		const result = Balance.createUser(msg.author.id);

		if (result.ok) {
			msg.reply("registrado! Seja bem-vindo(a) ao novo banco").catch(Common.discordErrorHandler);
		} else {
			msg.reply(result.error).catch(Common.discordErrorHandler);
		}
	},
	aliases: ["register", "registrar"],
	syntaxes: [""],
	description: "Cria uma nova conta no novo banco.",
	help: "Cria uma nova conta no novo banco. Você começa com $100.",
	examples: [""],
	permissions: Permission.SHITPOST
}