import { Command, Arguments, Permission, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";
import * as Balance from "../../balance";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (raw.length < 2) {
			msg.reply("diz a descrição po").catch(discordErrorHandler);
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
			msg.reply("esses truques não funcionam comigo <:glaso:743838981703073823>").catch(discordErrorHandler);
			return;
		}

		const result = Balance.changeDesc(msg.author.id, desc);
		if (result.success) {
			msg.reply("descrição alterada").catch(discordErrorHandler);
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