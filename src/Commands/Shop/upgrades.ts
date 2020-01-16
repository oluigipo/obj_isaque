import { Command, Arguments, Server, Permission, Emojis } from "../../definitions";
import { Message, RichEmbed } from "discord.js";
import { getUser, upgrades, upgradePrice, userBuyUpgrade } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		const u = getUser(msg.author.id);
		if (u === void 0) {
			msg.channel.send(`${Emojis.no}**|** ${msg.author} Você não tem uma lojinha!`);
			return;
		}

		if (args.length === 2) {
			let final = new RichEmbed();
			final.color = Server.botcolor;
			final.author = { name: (msg.member.nickname ? msg.member.nickname : msg.author.username), icon_url: msg.author.avatarURL };
			final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };
			upgrades.forEach((upg, i) => {
				final.addField(`${upg.name} (${u.upgrades[i]}/${upg.max})`, `Preço: \`$${upgradePrice(i, u.upgrades[i] + 1)}\`\nRenda Extra: \`$${upg.boost}\``);
			});

			msg.channel.send(final);
		} else {
			let i = 0;
			if (!isNaN(parseInt(args[2], 10))) {
				i = parseInt(args[2], 10) - 1;
				if (i < 0 || i >= upgrades.length) {
					msg.channel.send(`${Emojis.no}**|** ${msg.author} Este upgrade é inválido!`);
					return;
				}
			} else {
				i = upgrades.findIndex((upg) => upg.name === args[2]);
				if (i === -1) {
					msg.channel.send(`${Emojis.no}**|** ${msg.author} Este upgrade é inválido!`);
					return;
				}
			}

			const res = userBuyUpgrade(u.id, i);
			if (!res.success) {
				msg.channel.send(res.reason.replace('#', `${msg.author}`));
				return;
			}

			msg.channel.send(`${Emojis.yes}**|** ${msg.author} Upgrade \`${upgrades[i].name}\` comprado!`);
		}
	},
	permissions: Permission.None,
	aliases: ["upgrades", "upgrade", "up"],
	shortHelp: "Veja e compre upgrades para a sua lojinha!",
	longHelp: "Veja e compre upgrades para a sua lojinha!",
	example: `${Server.prefix}shop upgrade\n${Server.prefix}shop upgrade nome\n${Server.prefix}shop upgrade número`
};