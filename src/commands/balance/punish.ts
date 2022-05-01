import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message } from "discord.js";
import * as Balance from "../../balance";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (args.length < 3) {
			msg.reply("você precisa me dizer quanto dinheiro será cobrado e de quem cobrar").catch(Common.discordErrorHandler);
			return;
		}
		args.shift();

		if (args[0].kind !== ArgumentKind.NUMBER || args[0].value <= 0) {
			msg.reply("isso não é um valor válido. Ele precisa ser um número `> 0`").catch(Common.discordErrorHandler);
			return;
		}

		const qnt = args[0].value;
		args.shift();

		let final = Common.emptyEmbed();
		final.description = "";

		let change = false;
		for (const arg of args) {
			if (arg.kind === ArgumentKind.MEMBER) {
				const member = arg.value;
				const result = Balance.buy(member.id, qnt, true);

				if (result.ok) {
					final.description += `${member.id} perdeu \`$${qnt}\`!\n`;
					change = true;
				} else {
					final.description += `${member.id}: ${result.error}\n`;
				}
			}
		}

		if (change)
			Balance.updateDB();

		msg.channel.send({ embeds: [final] }).catch(Common.discordErrorHandler);
	},
	aliases: ["punish", "cobrar"],
	syntaxes: ["<qnt> <@user...>"],
	description: "Cobra dinheiro de usuários",
	help: "Cobra dinheiro de usuários. Pode ser como punição.",
	examples: ["50 @sonbra"],
	permissions: Permission.MOD
}