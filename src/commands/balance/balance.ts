import { Command, Arguments, Permission, ArgumentKind, discordErrorHandler, notNull, defaultEmbed, Server, isMember } from "../../defs";
import { Message, GuildMember, User } from "discord.js";
import * as Balance from "../../balance";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		let user: User | GuildMember = msg.author;

		if (args.length > 1 && args[1].kind === ArgumentKind.MEMBER)
			user = args[1].value;

		const result = Balance.userData(user.id);

		if (!result.success) {
			msg.reply(result.error).catch(discordErrorHandler);
			return;
		}

		if (isMember(user)) {
			user = user.user;
		}

		const userData = result.data;

		let final = defaultEmbed(notNull(msg.member));

		final.thumbnail = { url: user.avatarURL() ?? Server.defaultImage, width: 256, height: 256 };
		final.title = user.username;
		final.description = userData.description;

		final.addField("Saldo 💵", `$${userData.money.toFixed(2)}`, true);
		final.addField("Medalhas", Balance.medals(userData.medals).reduce((curr, m) => curr + `${m.emoji} ${m.name}\n`, ""), true);

		msg.channel.send(final).catch(discordErrorHandler);
	},
	aliases: ["balance", "saldo", "b", "profile", "perfil", "p"],
	syntaxes: ["", "@user"],
	description: "Vê as informações de um usuário",
	help: "Vê informações como saldo, medalhas, etc. de um usuário.",
	examples: ["", "@luigipo"],
	permissions: Permission.SHITPOST
}