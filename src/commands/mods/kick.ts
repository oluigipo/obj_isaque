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
		let failed = 0;
		let total = 0;
		for (const arg of args) {
			if (arg.kind === ArgumentKind.MEMBER) {
				const result = Moderation.kick(arg.value);
				total++;

				if (!result.ok) {
					final += `não deu pra kickar o(a) ${arg.value}. ${result.error}\n`;
					failed++;
					continue;
				}

				final += `KICKADA (ban para criança) ${arg.value}!\n`;
			}
		}

		if (total === 0)
			msg.reply("você precisa marcar o malucio").catch(Common.discordErrorHandler);
		else if (failed !== 0)
			msg.reply("deu pau na hora de kickar, hein").catch(Common.discordErrorHandler);

		if (final.length > 1800)
			final = final.substr(0, 1800);

		let embed = Common.defaultEmbed(Common.notNull(msg.author));
		embed.description = `[Ir para a mensagem](${msg.url})\n${final}`;
		delete embed.footer;
		delete embed.color;
		
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