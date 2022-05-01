import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message } from "discord.js";
import * as Balance from "../../balance";
import * as Common from "../../common";

const usersPerPage = 5;
const inline = false;

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		let page = 1;
		if (args.length > 1 && args[1].kind === ArgumentKind.NUMBER && args[1].value >= 1) {
			page = Math.floor(args[1].value);
		}

		const result = Balance.richest(page - 1, usersPerPage);
		let final = Common.defaultEmbed(Common.notNull(msg.member));

		final.title = `Burguesia. Página ${page}/${Math.ceil(Balance.userCount() / usersPerPage)}`;

		if (result.some(u => u.id === msg.author.id))
			final.description = "eita, olha você ali";
		else if (page === 1)
			final.description = "*dica: você pode ver outras páginas colocando o número dela após o comando*";
		else
			final.description = "burgueses... todos!";

		for (let i = 0; i < result.length; i++) {
			const n = (page - 1) * usersPerPage + i + 1;
			// const name = msg.guild?.members.cache.get(result[i].id)?.displayName;
			const name = `<@${result[i].id}>`;
			const money = `$${result[i].money}`;
			const medals = Balance.medals(result[i].medals).reduce((acc, m) => acc + m.emoji + " ", "");
			const arr = ['🟧', '⬜', '🟫'];

			let title = (arr[n - 1] ?? "") + ` ${n}º - ${money} ${medals}`;
			let desc = `${name}`;
			if (result[i].id === msg.author.id)
				desc = "🔴 " + desc;

			final.fields.push({ name: title.trim(), value: desc.trim(), inline });
		}

		if (final.fields.length === 0)
			final.fields.push({ name: `Último lugar - $0`, value: `obj_isaque, agora um fantasma\n👻`, inline });

		msg.channel.send({ embeds: [final] }).catch(Common.discordErrorHandler);
	},
	aliases: ["richest", "burgueses", "rank"],
	syntaxes: ["[página]"],
	description: "Conheça os maiores burgueses do servidor.",
	help: "Manda uma lista com os 10 usuários mais ricos do servidor.",
	examples: ["", "2"],
	permissions: Permission.SHITPOST
}