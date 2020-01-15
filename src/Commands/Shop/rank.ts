import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message, RichEmbed } from "discord.js";
import { getTop, CLS } from "../../Shop";

const e = ['🟧', '⬛', '🟫'];
export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		const users = getTop(CLS.INCOMES);

		const final = new RichEmbed();
		final.color = Server.botcolor;
		final.author = { name: (msg.member.nickname ? msg.member.nickname : msg.author.username), icon_url: msg.author.avatarURL };
		final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };
		final.title = "Lojinhas com maior renda!";

		users.forEach((u, i) => {
			final.addField(`${e[i] ?? ''} ${i + 1}º`, u.name, false);
		});

		msg.channel.send(final);
	},
	permissions: Permission.None,
	aliases: ["rank", "r"],
	shortHelp: "Veja as lojas com as maiores rendas!",
	longHelp: "Veja as lojas com as maiores rendas!",
	example: `${Server.prefix}shop rank`
};