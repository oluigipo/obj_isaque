import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message } from "discord.js";
import * as Balance from "../../balance";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (args.length < 3) {
			msg.reply("você precisa mencionar alguém para dar a medalha e qual medalha você quer dar\ndá um `!!help medalha` para umas informações a mais")
				.catch(Common.discordErrorHandler);
			return;
		}

		if (args[1].kind !== ArgumentKind.MEMBER) {
			msg.reply("marque um usuário").catch(Common.discordErrorHandler);
			return;
		}
		const id = args[1].value.id;

		if (args[2].kind !== ArgumentKind.STRING) {
			msg.reply("essa medalha não existe não").catch(Common.discordErrorHandler);
			return;
		}
		const medal = args[2].value;

		const result = Balance.giveMedal(id, medal.toLowerCase());

		if (result.ok) {
			msg.reply("medalha dada").catch(Common.discordErrorHandler);
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