// @NOTE(luigi): disabled

import { Command, Arguments, Permission, ArgumentKind, discordErrorHandler, matchArguments } from "../../defs";
import { Message } from "discord.js";
import * as Balance from "../../balance";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (args.length < 3) {
			msg.reply("transferir quanto e pra quem?").catch(discordErrorHandler);
			return;
		}

		if (args[1].kind !== ArgumentKind.MEMBER) {
			msg.reply("quem?").catch(discordErrorHandler);
			return;
		}
		const member = args[1].value;

		if (args[2].kind !== ArgumentKind.NUMBER) {
			msg.reply("quanto?").catch(discordErrorHandler);
			return;
		}
		const qnt = args[2].value;

		const result = Balance.transfer(msg.author.id, member.id, qnt);

		if (result.success) {
			msg.reply(`você enviou \`$${qnt}\` para <@${member.id}>`).catch(discordErrorHandler);
		} else {
			msg.reply(result.error).catch(discordErrorHandler);
		}
	},
	aliases: ["transfer", "transferir"],
	syntaxes: ["<user> <qnt>"],
	description: "Transfere dinheiro para outro usuário",
	help: "Transfere dinheiro para outro usuário",
	examples: ["@luigipo 100"],
	permissions: Permission.NONE
}