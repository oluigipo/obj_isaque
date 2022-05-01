import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message } from "discord.js";
import * as Balance from "../../balance";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (args.length < 3) {
			msg.reply("você precisa me dizer quanto dinheiro será dado e quem vai recebê-lo").catch(Common.discordErrorHandler);
			return;
		}
		args.shift();

		if (args[0].kind !== ArgumentKind.NUMBER || args[0].value <= 0) {
			msg.reply("isso não é um valor válido. Ele precisa ser um número `> 0`").catch(Common.discordErrorHandler);
			return;
		}

		const qnt = args[0].value;
		args.shift();

		let ids = <string[]>[];
		for (let i = 0; i < args.length; i++) {
			const arg = args[i];
			if (arg.kind === ArgumentKind.MEMBER) {
				ids.push(arg.value.id);
			}
		}

		const result = Balance.prize(ids, qnt);
		let final = Common.emptyEmbed();
		final.description = "";

		for (let i = 0; i < result.length; i++) {
			const r = result[i];
			if (r.ok) {
				final.description += `<@${ids[i]}> ganhou \`$${qnt}\`!\n`;
			} else {
				final.description += `<@${ids[i]}>: ${r.error}\n`;
			}
		}

		msg.channel.send({ embeds: [final] }).catch(Common.discordErrorHandler);
	},
	aliases: ["prize", "premio"],
	syntaxes: ["<qnt> <@users...>"],
	description: "Dá dinheiro para um usuário.",
	help: "Dá dinheiro para um usuário.",
	examples: ["10 @Crickkin @Bruxão"],
	permissions: Permission.MOD
}