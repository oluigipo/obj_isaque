import { Command, Arguments, Permission, discordErrorHandler, ArgumentKind } from "../../defs";
import { Message } from "discord.js";
import * as Balance from "../../balance";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (args.length < 3) {
			msg.reply("você precisa mencionar alguém para dar a medalha e qual medalha você quer dar\ndá um `!!help medalha` para umas informações a mais")
				.catch(discordErrorHandler);
			return;
		}

		if (args[1].kind !== ArgumentKind.MEMBER) {
			msg.reply("marque um usuário").catch(discordErrorHandler);
			return;
		}
		const id = args[1].value.id;

		if (args[2].kind !== ArgumentKind.STRING) {
			msg.reply("essa medalha não existe não").catch(discordErrorHandler);
			return;
		}
		const medal = args[2].value;

		const result = Balance.giveMedal(id, medal.toLowerCase());

		if (result.success) {
			msg.reply("medalha dada").catch(discordErrorHandler);
		} else {
			msg.reply("deu uma coisa errada: " + result.error);
		}
	},
	aliases: ["medal", "medalha"],
	syntaxes: ["<user> <nome>"],
	description: "dá uma medalha pra alguém",
	help: "dá uma medalha pra alguém. No servidor do bot tem os nomes no canal #info",
	examples: ["@NoNe jam"],
	permissions: Permission.MOD
}