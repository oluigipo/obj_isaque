import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message } from "discord.js";
import * as Moderation from "../../moderation";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[]) {
		if (args.length < 2) {
			msg.channel.send("é pra kickar quem?").catch(Common.discordErrorHandler);
			return;
		}
		args.shift(); // consume command

		let final = `${msg.author}\n`;
		for (const arg of args) {
			if (arg.kind === ArgumentKind.MEMBER) {
				const result = Moderation.kick(arg.value);

				if (!result.ok) {
					final += `não deu pra kickar o(a) ${arg.value}. ${result.error}\n`;
					continue;
				}

				final += `KICKADO (ban para criança) ${arg.value}!\n`;
			}
		}

		if (final === "")
			final = "você precisa marcar o maluco";
		else if (final.length > 2000)
			final = `eita, você kickou tanta gente que passou do limite de 2000 chars do discord ${Common.EMOJIS.surrender.repeat(3)}`;

		let embed = Common.emptyEmbed();
		embed.description = final;
		Moderation.logChannel.send({ embeds: [embed] }).catch(Common.discordErrorHandler);
		msg.react(Common.EMOJIS.yes).catch(Common.discordErrorHandler);
	},
	syntaxes: ["<@user...>"],
	permissions: Permission.MOD,
	aliases: ["kick", "kickar"],
	description: "Kicka usuários",
	help: "Kicka um ou mais usuários do servidor",
	examples: [`@user`, `@user1 @user2...`]
};