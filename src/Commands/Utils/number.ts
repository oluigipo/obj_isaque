import { Command, Arguments, Server, CommonMessages } from "../../definitions";
import { Message, RichEmbed } from "discord.js";

function makeRGB(r: number, g: number, b: number): number {
	return (r << 16) | (g << 8) | (b);
}

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		let final = new RichEmbed();
		final.color = makeRGB(48, 162, 70);
		final.author = { name: (msg.member.nickname ? msg.member.nickname : msg.author.username), icon_url: msg.author.avatarURL };
		final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };

		let num: number, base: number;
		if (args.length < 2) {
			msg.channel.send(`${msg.author} ${CommonMessages.syntaxError}`);
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

		final.addField("Decimal", num.toString(10));
		final.addField("Octal", num.toString(8));
		final.addField("Hexadecimal", num.toString(16));
		final.addField("Binário", num.toString(2));

		msg.channel.send(final);
	},
	staff: false,
	aliases: ["number", "numero"],
	shortHelp: "Mostra como um número é representado em diferentes sistemas numéricos",
	longHelp: "Mostra como um número é representado no sistema decimal, octal, hexadecimal e binário.",
	example: `${Server.prefix}number base numero\n${Server.prefix}number 16 ff\n${Server.prefix}number 8 107`
};