import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

function makeRGB(r: number, g: number, b: number): number {
	return (r << 16) | (g << 8) | (b);
}

export default <Command>{
	async run(msg: Message<true>, _: Argument[], args: string[]) {
		let final = Common.defaultEmbed(Common.notNull(msg.member));

		let num: number, base: number;
		if (args.length < 2) {
			msg.channel.send(`${msg.author} diz o número aí pô`).catch(Common.discordErrorHandler);
			return;
		}

		if (args.length >= 3) {
			base = parseInt(args[1]);
			if (isNaN(base) || base < 2 || base > 36) {
				msg.channel.send(`${msg.author} base inválida`).catch(Common.discordErrorHandler);
				return;
			}
		} else {
			base = 10;
		}

		num = parseInt(args[1 + Number(args.length >= 3)], base);
		if (isNaN(num)) {
			msg.channel.send(`${msg.author} número inválido`).catch(Common.discordErrorHandler);
			return;
		}

		final.title = "Resultado";
		final.description = "Estas são as representações desse número em diferentes bases:";

		final.fields.push({ name: "Decimal", value: num.toString(10), inline: true });
		final.fields.push({ name: "Octal", value: num.toString(8), inline: true });
		final.fields.push({ name: "Hexadecimal", value: num.toString(16), inline: true });
		final.fields.push({ name: "Binário", value: num.toString(2), inline: true });

		msg.channel.send({ embeds: [final] }).catch(Common.discordErrorHandler);
	},
	syntaxes: ["<base> <numero>", "<numero>"],
	permissions: Permission.NONE,
	aliases: ["number", "numero"],
	description: "Mostra como um número é representado em diferentes sistemas numéricos",
	help: "Mostra como um número é representado no sistema decimal, octal, hexadecimal e binário.",
	examples: [`999`, `16 ff`, `8 107`]
};