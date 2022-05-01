// @NOTE(luigi): disabled

import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message } from "discord.js";
import * as Balance from "../../balance";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (args.length < 3) {
			msg.reply("transferir quanto e pra quem?").catch(Common.discordErrorHandler);
			return;
		}

		if (args[1].kind !== ArgumentKind.MEMBER) {
			msg.reply("quem?").catch(Common.discordErrorHandler);
			return;
		}
		const member = args[1].value;

		if (args[2].kind !== ArgumentKind.NUMBER) {
			msg.reply("quanto?").catch(Common.discordErrorHandler);
			return;
		}
		const qnt = args[2].value;

		const result = Balance.transfer(msg.author.id, member.id, qnt);

		if (result.ok) {
			msg.reply(`você enviou \`$${qnt}\` para ${member}`).catch(Common.discordErrorHandler);
		} else {
			msg.reply(result.error).catch(Common.discordErrorHandler);
		}
	},
	aliases: ["transfer", "transferir"],
	syntaxes: ["<user> <qnt>"],
	description: "Transfere dinheiro para outro usuário",
	help: "Transfere dinheiro para outro usuário",
	examples: ["@luigipo 100"],
	permissions: Permission.NONE
}