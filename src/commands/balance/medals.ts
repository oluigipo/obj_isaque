import { Command, Arguments, Permission, defaultEmbed, notNull } from "../../defs";
import { Message } from "discord.js";
import * as Balance from "../../balance";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		const list = Balance.Medals.slice(1);

		let final = defaultEmbed(notNull(msg.member));
		final.title = "Medalhas";
		final.description = "";

		for (const medal of list) {
			final.description += `${medal.emoji} ${medal.name}\n`;
		}

		msg.reply(final);
	},
	aliases: ["medals", "medalhas"],
	syntaxes: [""],
	description: "Mostra a lista de medalhas existentes",
	help: "Mostra a lista de medalhas existentes",
	examples: [""],
	permissions: Permission.NONE
}