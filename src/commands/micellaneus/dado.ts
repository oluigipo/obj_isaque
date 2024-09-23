import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message } from "discord.js";
import { mute } from "../../moderation";
import * as Common from "../../common";

const DICE_REGEX = /(\d*)d(\d+)/;

function roll(count: number, sides: number): number | string {
	if (count >= 200) {
		return "`Não posso rodar tantos dados assim. Tá achando que é a prova do OBMEP?`";
	}
	if (count == 1) return Math.floor(Math.random() * sides) + 1;
	return new Array(count)
		.fill(null)
		.map(_ => Math.floor(Math.random() * sides) + 1)
		.reduce((acc, x) => acc + x, 0);
}

const RITUAL = ["prim$", "di$", "trim$", "quadri$", "m$n", "quarteri$", "ept$", "$to", "$ene", "d$c", "entec$", "mid$"];

export default <Command>{
	async run(msg: Message<true>, _: Argument[], args: string[]) {
		let expr = args.slice(1).join(' ').trim();

		if (expr.length === 0)
			return msg.channel.send(`Voce rolou um d6 e conseguiu ${roll(1, 6)}`).catch(Common.discordErrorHandler);
		if (expr === "em casa")
			return msg.channel.send(`<:renda:551130874750566401>`).catch(Common.discordErrorHandler);

		// @NOTE(luigi): disabled
		// if (args[1] === "mortis") {
		// 	const now = new Date();
		// 	const hours = (now.getUTCHours() + 9) % 12;
		// 	const minutes = now.getUTCMinutes();
		// 	const cmd = RITUAL[hours].replace('$', minutes > 30 ? 'a' : 'o');

		// 	const tempo = Math.floor(Math.random() * 26) + 5;
		// 	if (args[2] == cmd) {
		// 		if (Math.random() > 0.8) {
		// 			mute(msg.author.id, tempo * Time.minute, 'Usou o dado mortis');
		// 			return msg.channel.send(`${msg.author} foi mutado por ${tempo} horas ao usar o dado mortis!`).catch(discordErrorHandler);
		// 		} else {
		// 			return msg.channel.send(`${msg.author} usou o dado da morte e sobreviveu!`).catch(discordErrorHandler);
		// 		}
		// 	}
		// 	return msg.channel.send(`Voce escolheu o dado da morte, para rolar seu destino digite \`!!dado mortis ${cmd}\``).catch(discordErrorHandler);
		// }

		const match = DICE_REGEX.exec(expr);
		if (match) {
			let count = parseInt(match[1]);
			count = isNaN(count) ? 1 : count;

			let faces = parseInt(match[2]);
			msg.channel.send(`Voce rolou um ${match[0]} e conseguiu ${roll(count, faces)}`).catch(Common.discordErrorHandler);
		} else {
			msg.channel.send(`Não entendi essa expressão`).catch(Common.discordErrorHandler);
		}
	},
	syntaxes: ["[numero = 6]", "<dice notation>"],
	permissions: Permission.SHITPOST,
	aliases: ["dado"],
	description: "Rola um dado, feito por <@310480160640073729>",
	help: `Rola um dado usando notação de dado`,
	examples: [``, "d20", "5d6"]
};
