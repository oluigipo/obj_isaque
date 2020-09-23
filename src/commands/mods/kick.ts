import { Command, Arguments, Server, Permission, ArgumentKind, Emojis, defaultEmbed, notNull, discordErrorHandler, emptyEmbed, Channels } from "../../defs";
import * as Moderation from "../../moderation";
import { Message } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments) {
		if (args.length < 2) {
			msg.channel.send("é pra kickar quem?").catch(discordErrorHandler);
			return;
		}
		args.shift(); // consume command

		let final = "";
		for (const arg of args) {
			if (arg.kind === ArgumentKind.MEMBER) {
				const result = Moderation.kick(arg.value);

				if (!result.success) {
					final += `não deu pra kickar o(a) ${arg.value}. ${result.error}\n`;
					continue;
				}

				final += `KICKADO (ban para criança) ${arg.value}!\n`;
			}
		}

		if (final === "")
			final = "você precisa marcar o maluco";
		else if (final.length > 2000)
			final = `eita, você kickou tanta gente que passou do limite de 2000 chars do discord ${Emojis.surrender.repeat(3)}`;

		let embed = emptyEmbed();
		embed.description = final;
		Channels.logObject.send(`${msg.author}`, embed).catch(discordErrorHandler);
	},
	syntaxes: ["<@user...>"],
	permissions: Permission.MOD,
	aliases: ["kick", "kickar"],
	description: "Kicka usuários",
	help: "Kicka um ou mais usuários do servidor",
	examples: [`@user`, `@user1 @user2...`]
};