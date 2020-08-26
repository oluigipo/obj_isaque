import { Command, Arguments, Permission, ArgumentKind, defaultEmbed, notNull, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";
import * as Balance from "../../balance";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		let page = 1;
		if (args.length > 1 && args[1].kind === ArgumentKind.NUMBER && args[1].value >= 1) {
			page = Math.floor(args[1].value);
		}

		const result = Balance.richest(page - 1);
		let final = defaultEmbed(notNull(msg.member));

		final.title = "Burguesia. Página " + String(page);
		final.description = "hm";

		for (let i = 0; i < result.length; i++) {
			const n = (page - 1) * 9 + i + 1;
			const name = `<@${result[i].id}>`;
			const money = result[i].money;
			const medals = Balance.medals(result[i].medals).reduce((acc, m) => acc + m.emoji + " ", "");

			final.addField(`${n}º - $${money}`, `${name}\n${medals}`.trimEnd(), true);
		}

		if (final.fields.length === 0)
			final.addField(`Último lugar - $0`, `obj_isaque, agora um fantasma\n👻`, true);

		msg.channel.send(final).catch(discordErrorHandler);
	},
	aliases: ["richest", "burgueses"],
	syntaxes: ["[página]"],
	description: "Conheça os maiores burgueses do servidor.",
	help: "Manda uma lista com os 10 usuários mais ricos do servidor.",
	examples: ["", "2"],
	permissions: Permission.SHITPOST
}