import { Command, Arguments, Server, Permission, defaultEmbed, notNull, MsgTemplates, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";

function makeRGB(r: number, g: number, b: number): number {
	return (r << 16) | (g << 8) | (b);
}

export default <Command>{
	async run(msg: Message, _: Arguments, args: string[]) {
		let final = defaultEmbed(notNull(msg.member));

		let num: number, base: number;
		if (args.length < 2) {
			msg.channel.send(MsgTemplates.error(msg.author, this.aliases[0]));
			return;
		}

		if (args.length >= 3) {
			base = parseInt(args[1]);
			if (isNaN(base) || base < 2 || base > 36) {
				msg.channel.send(`${msg.author} Base inválida!`);
				return;
			}
		} else {
			base = 10;
		}

		num = parseInt(args[1 + Number(args.length >= 3)], base);
		if (isNaN(num)) {
			msg.channel.send(`${msg.author} Número inválido!`);
			return;
		}

		final.title = "Resultado";
		final.description = "Estas são as representações desse número em diferentes bases:";

		final.addField("Decimal", num.toString(10), true);
		final.addField("Octal", num.toString(8), true);
		final.addField("Hexadecimal", num.toString(16), true);
		final.addField("Binário", num.toString(2), true);

		msg.channel.send(final)
			.catch(discordErrorHandler);
	},
	syntaxes: ["<base> <numero>", "<numero>"],
	permissions: Permission.NONE,
	aliases: ["number", "numero"],
	description: "Mostra como um número é representado em diferentes sistemas numéricos",
	help: "Mostra como um número é representado no sistema decimal, octal, hexadecimal e binário.",
	examples: [`${Server.prefix}number base numero`, `${Server.prefix}number 16 ff`, `${Server.prefix}number 8 107`]
};