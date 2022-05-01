import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message, GuildMember } from "discord.js";
import * as Moderation from "../../moderation";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (args.length < 2) {
			msg.channel.send("é pra banir quem?").catch(Common.discordErrorHandler);
			return;
		}
		args.shift(); // consume command

		let final = "";
		let reason: string | undefined = undefined;
		let usersToBan: GuildMember[] = [];
		for (let i = 0; i < args.length; ++i) {
			const arg = args[i];

			if (reason !== undefined)
				reason += " " + raw[i];

			if (arg.kind === ArgumentKind.MEMBER)
				usersToBan.push(arg.value);
			else if (reason === undefined)
				reason = raw[i];
		}

		for (const user of usersToBan) {
			const result = Moderation.ban(user);
			if (!result.ok) {
				final += `o(a) ${user} é muito forte para mim. ${result.error}\n`;
				continue;
			}

			final += `SINTA O PESO DO MARTELO ${user}!\n`;
		}

		if (final === "")
			final = "você precisa marcar o maluco";
		else if (final.length > 2000)
			final = `eita, você baniu tanta gente que passou do limite de 2000 chars do discord ${Common.EMOJIS.surrender.repeat(3)}`;

		let embed = Common.emptyEmbed();
		embed.description = `${msg.author}\n${final}`;
		Moderation.logChannel.send({ embeds: [embed] }).catch(Common.discordErrorHandler);
		msg.react(Common.EMOJIS.yes).catch(Common.discordErrorHandler);
	},
	syntaxes: ["<@user...> [reason]"],
	permissions: Permission.MOD,
	aliases: ["ban", "banir"],
	description: "Banir usuários",
	help: "Bane um ou mais usuários do servidor",
	examples: [`@user`, `@user1 @user2...`]
};