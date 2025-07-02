import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message, GuildMember } from "discord.js";
import * as Moderation from "../../moderation";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message<true>, args: Argument[], raw: string[]) {
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

		if (usersToBan.length === 0) {
			msg.reply("você precisa marcar o maluco").catch(Common.discordErrorHandler);
			return;
		}

		let failed = 0;
		for (const user of usersToBan) {
			const result = Moderation.ban(user);
			if (!result.ok) {
				final += `o(a) ${user} é muito forte para mim. ${result.error}\n`;
				failed++;
				continue;
			}

			final += `SINTA O PESO DO MARTELO ${user}!\n`;
		}

		if (final.length > 1800)
			final = final.substr(0, 1800);
		if (failed > 0)
			msg.reply("deu pau na hora de banir, hein").catch(Common.discordErrorHandler);

		let embed = Common.defaultEmbed(Common.notNull(msg.author));
		embed.description = `[Ir para a mensagem](${msg.url})\n${final}`;
		delete embed.footer;
		delete embed.color;

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