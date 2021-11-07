import { Command, Arguments, Server, Permission, ArgumentKind, Emojis, defaultEmbed, notNull, discordErrorHandler, emptyEmbed, Channels } from "../../defs";
import * as Moderation from "../../moderation";
import { Message, GuildMember } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (args.length < 2) {
			msg.channel.send("é pra banir quem?").catch(discordErrorHandler);
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
			if (!result.success) {
				final += `o(a) ${user} é muito forte para mim. ${result.error}\n`;
				continue;
			}

			final += `SINTA O PESO DO MARTELO ${user}!\n`;
		}

		if (final === "")
			final = "você precisa marcar o maluco";
		else if (final.length > 2000)
			final = `eita, você baniu tanta gente que passou do limite de 2000 chars do discord ${Emojis.surrender.repeat(3)}`;

		let embed = emptyEmbed();
		embed.description = `${msg.author}\n${final}`;
		Channels.logObject.send(embed).catch(discordErrorHandler);
		msg.react(Emojis.yes).catch(discordErrorHandler);
	},
	syntaxes: ["<@user...> [reason]"],
	permissions: Permission.MOD,
	aliases: ["ban", "banir"],
	description: "Banir usuários",
	help: "Bane um ou mais usuários do servidor",
	examples: [`@user`, `@user1 @user2...`]
};