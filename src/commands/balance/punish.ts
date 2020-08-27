import { Command, Arguments, Permission, discordErrorHandler, ArgumentKind, emptyEmbed } from "../../defs";
import { Message } from "discord.js";
import * as Balance from "../../balance";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (args.length < 3) {
			msg.reply("você precisa me dizer quanto dinheiro será cobrado e de quem cobrar").catch(discordErrorHandler);
			return;
		}
		args.shift();

		if (args[0].kind !== ArgumentKind.NUMBER || args[0].value <= 0) {
			msg.reply("isso não é um valor válido. Ele precisa ser um número `> 0`").catch(discordErrorHandler);
			return;
		}

		const qnt = args[0].value;
		args.shift();

		let final = emptyEmbed();
		final.description = "";

		let change = false;
		for (const arg of args) {
			if (arg.kind === ArgumentKind.MEMBER) {
				const member = arg.value;
				const result = Balance.buy(member.id, qnt, true);

				if (result.success) {
					final.description += `<@${member.id}> perdeu \`$${qnt}\`!\n`;
					change = true;
				} else {
					final.description += `<@${member.id}>: ${result.error}\n`;
				}
			}
		}

		if (change) Balance.updateDB();

		msg.channel.send(final).catch(discordErrorHandler);
	},
	aliases: ["punish", "cobrar"],
	syntaxes: ["<qnt> <@user...>"],
	description: "Cobra dinheiro de usuários",
	help: "Cobra dinheiro de usuários. Pode ser como punição.",
	examples: ["50 @sonbra"],
	permissions: Permission.MOD
}