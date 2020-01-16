import { Command, Arguments, Server, Permission, Emojis } from "../../definitions";
import { Message, RichEmbed } from "discord.js";
import { getCompany, getUser, companyCreate, companyProducts, companyIncomes, companyUpgradePrice, companyMembers, moneyPerHour, User } from "../../Shop";

const e = ['🟧', '⬛', '🟫'];
export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length === 2) {
			const u = getUser(msg.author.id);
			if (u === void 0) {
				msg.channel.send(`${Emojis.no} **|** ${msg.author} Você não tem uma lojinha!`);
				return;
			}
			const company = getCompany(u);
			if (company === void 0) {
				msg.channel.send(`${Emojis.no} **|** ${msg.author} Você não está em uma empresa!`);
				return;
			}

			let final = new RichEmbed();

			final.color = Server.botcolor;
			final.author = { name: (msg.member.nickname ? msg.member.nickname : msg.author.username), icon_url: msg.author.avatarURL };
			final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };
			final.title = company.name;

			final.addField("📦 Produtos", companyProducts(company), true);
			final.addField("📈 Renda", `$${companyIncomes(company)}`, true);
			final.addField("💵 Saldo", `$${company.money}`, true);
			final.addField("📜 Dono(a)", getUser(company.members[0])?.name ?? "WTFFFFFF", true);
			final.addField("💎 Nível", company.level, true);
			final.addField("🧰 Próximo Nível", `$${companyUpgradePrice(company.level)}`, true);

			let members = companyMembers(company).sort((u1, u2) => moneyPerHour(u2.upgrades) - moneyPerHour(u1.upgrades));
			final.addField("💰 Top Membros" + (members.length > 10 ? ` (10/${members.length})` : ""), members.slice(0, Math.min(10, members.length)).reduce((a: string[], c: User, i) => {
				a.push(`\`${i + 1}º-\` ${c.name}`);
				return a;
			}, <string[]>[]).join('\n'));

			msg.channel.send(final);
		} else {
			const name = args.slice(2).join(' ');
			const result = companyCreate(msg.author.id, name);

			if (!result.success) msg.channel.send(result.reason.replace('#', `${msg.author}`));
			else msg.channel.send(`${Emojis.yes} **|** Parabéns! Você acaba de fundar a **${name}**!`);
		}
	},
	permissions: Permission.None,
	aliases: ["company", "empresa", "c"],
	shortHelp: "Visualize ou inicie agora a sua empresa!",
	longHelp: "Visualize ou inicie agora a sua empresa! Uma empresa é um grupo de lojinhas. Cada empresa tem seu nível, quanto maior ele for, maior o bonus que você receberá por trabalhar e pelo bônus diário diariamente! O custo para criar uma empresa é `$50.000`",
	example: `\`${Server.prefix}shop company nome\` Criar uma empresa\n\`${Server.prefix}shop company\` Visualizar sua empresa`
};