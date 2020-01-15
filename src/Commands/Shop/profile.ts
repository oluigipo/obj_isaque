import { Command, Arguments, Server, Permission, Emojis } from "../../definitions";
import { Message, RichEmbed } from "discord.js";
import { getUser, getCompany, emojis, moneyPerHour } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		let id = msg.author.id;
		if (args.length > 2) id = msg.mentions.members.first()?.id ?? id;

		const u = getUser(id);
		if (u === void 0) {
			msg.channel.send(`${Emojis.no} **|** Este usuário/você não tem uma lojinha!`);
			return;
		}

		const m = msg.guild.members.find((m) => m.user.id === id);
		const c = getCompany(u);

		let final = new RichEmbed();
		final.author = { name: (msg.member.nickname ? msg.member.nickname : msg.author.username), icon_url: msg.author.avatarURL };
		final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };
		final.thumbnail = { url: m.user.avatarURL };
		final.title = `${u.name}`;
		final.description = `*${u.slogan}*`;
		final.color = Server.botcolor;
		if (c !== void 0) final.addField("🗃️ Empresa" + (c.members[0] === id ? " (Dono)" : ""), c.name, true);
		final.addField("💵 Saldo", `$${u.money}`, true);
		final.addField("📦 Vende", `${emojis.slice(u.emoji, (u.emoji + 2)) ?? '?'}`, true);
		final.addField("💸 Renda", `$${moneyPerHour(u.upgrades)} p/ Hora`);

		msg.channel.send(final);
	},
	permissions: Permission.None,
	aliases: ["profile", "balance", "b"],
	shortHelp: "Veja informações sobre a sua lojinha.",
	longHelp: "Veja informações sobre a sua lojinha.",
	example: `${Server.prefix}shop profile`
};