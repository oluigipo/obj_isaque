import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";
import * as Balance from "../../balance";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (raw.length < 2) {
			msg.reply("diz a descrição po").catch(Common.discordErrorHandler);
			return;
		}

		const desc = raw.slice(1).join(' ')
			.trim()
			.replace(/[­⠀]/g, '') // remove: any zero-width char (240), black braile
			.replace(/\n\n+/g, '\n')
			.replace(/\s\s+/, '')
			.replace(/[\*\`\_\~(\|\|)]+\s+[\*\`\_\~(\|\|)]+/g, '')
			.trim();

		if (desc.length === 0) {
			msg.reply("esses truques não funcionam comigo <:glaso:743838981703073823>").catch(Common.discordErrorHandler);
			return;
		}

		const result = Balance.changeDesc(msg.author.id, desc);
		if (result.ok) {
			msg.reply("descrição alterada").catch(Common.discordErrorHandler);
		} else {
			msg.reply("erro: " + result.error);
		}
	},
	aliases: ["desc", "description"],
	syntaxes: ["<nova descrição>"],
	description: "Muda sua descrição",
	help: "Muda sua descrição. Markdown é permitido.",
	examples: ["gato leão"],
	permissions: Permission.SHITPOST
}