import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Balance from "../../balance";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		const list = Balance.Medals.slice(1);

		let final = Common.defaultEmbed(Common.notNull(msg.member));
		final.title = "Medalhas";
		final.description = "";

		for (const medal of list) {
			final.description += `${medal.emoji} ${medal.name}\n`;
		}

		msg.reply({ embeds: [final] });
	},
	aliases: ["medals", "medalhas"],
	syntaxes: [""],
	description: "Mostra a lista de medalhas existentes",
	help: "Mostra a lista de medalhas existentes",
	examples: [""],
	permissions: Permission.NONE
}