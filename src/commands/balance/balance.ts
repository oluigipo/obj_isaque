import { Command, Argument, Permission, ArgumentKind } from "../index";
import * as Common from "../../common";
import { Message, GuildMember, User } from "discord.js";
import * as Balance from "../../balance";

export default <Command>{
	async run(msg: Message<true>, args: Argument[], raw: string[]) {
		let user: User | GuildMember = msg.author;

		if (args.length > 1 && args[1].kind === ArgumentKind.MEMBER)
			user = args[1].value;

		const result = Balance.userData(user.id);

		if (!result.ok) {
			msg.reply(result.error).catch(Common.discordErrorHandler);
			return;
		}

		if (Common.isMember(user)) {
			user = user.user;
		}

		const userData = result.data;

		let final = Common.defaultEmbed(Common.notNull(msg.member));

		final.thumbnail = { url: user.avatarURL() ?? Common.SERVER.defaultImage, width: 256, height: 256 };
		final.title = user.username;
		final.description = userData.description;

		final.fields.push({ name: "Saldo 💵", value: `$${userData.money.toFixed(2)}`, inline: true });
		final.fields.push({ name: "Medalhas", value: Balance.medals(userData.medals).reduce((curr, m) => curr + `${m.emoji} ${m.name}\n`, ""), inline: true });

		msg.channel.send({ embeds: [final]}).catch(Common.discordErrorHandler);
	},
	aliases: ["balance", "saldo", "b", "profile", "perfil", "p"],
	syntaxes: ["", "@user"],
	description: "Vê as informações de um usuário",
	help: "Vê informações como saldo, medalhas, etc. de um usuário.",
	examples: ["", "@luigi"],
	permissions: Permission.SHITPOST
}