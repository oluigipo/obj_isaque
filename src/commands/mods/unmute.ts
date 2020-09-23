import { Command, Arguments, Permission, ArgumentKind, Emojis, discordErrorHandler, defaultEmbed, notNull, emptyEmbed, Channels } from "../../defs";
import { Message } from "discord.js";
import * as Moderation from "../../moderation";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (args.length < 2) {
			msg.reply("desmutar quem?").catch(discordErrorHandler);
			return;
		}

		let finalmsg = "";
		for (const arg of args) {
			if (arg.kind === ArgumentKind.MEMBER) {
				const member = arg.value;

				const result = Moderation.weakunmute(member.id, member);

				if (!result.success) {
					finalmsg += `Algo deu errado ao desmutar ${member}. \`${result.error}\`\n`;
					continue;
				}

				finalmsg += `Você está livre ${member}!`;

				if (result.warning)
					finalmsg += ` Nota: ${result.warning}`;

				finalmsg += '\n';
			}
		}

		// no one muted
		if (finalmsg === "")
			finalmsg = "desmutar quem?";
		else {
			// update the db if someone was unmuted
			Moderation.updateDB();
			if (finalmsg.length >= 2000)
				finalmsg = `caraca, tá tão bonzinho que a mensagem passou do limite de 2000 chars do discord ${Emojis.surrender.repeat(3)}`
		}

		let embed = emptyEmbed();
		embed.description = finalmsg;
		Channels.logObject.send(`${msg.author}`, embed).catch(discordErrorHandler);
	},
	aliases: ["unmute"],
	syntaxes: ["@users..."],
	description: "Desmuta um ou mais membros.",
	help: "Desmuta um ou mais membros.",
	examples: ["@NoNe"],
	permissions: Permission.MOD
}