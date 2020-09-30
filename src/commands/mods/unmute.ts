import { Command, Arguments, Permission, ArgumentKind, Emojis, discordErrorHandler, defaultEmbed, notNull, emptyEmbed, Channels } from "../../defs";
import { GuildMember, Message } from "discord.js";
import * as Moderation from "../../moderation";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (args.length < 2) {
			msg.reply("desmutar quem?").catch(discordErrorHandler);
			return;
		}

		let finalmsg = `${msg.author}\n`;
		for (const arg of args) {
			let id: string, member: GuildMember | undefined;
			switch (arg.kind) {
				default:
					continue;
				case ArgumentKind.MEMBER:
					id = arg.value.id;
					member = arg.value;
					break;
				case ArgumentKind.USERID:
					id = arg.value;
					member = undefined;
					break;
			}

			const result = Moderation.weakunmute(id, member);

			if (!result.success) {
				finalmsg += `Algo deu errado ao desmutar <@${id}>. \`${result.error}\`\n`;
				continue;
			}

			finalmsg += `Você está livre <@${id}>!`;

			if (result.warning)
				finalmsg += ` Nota: ${result.warning}`;

			finalmsg += '\n';
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
		Channels.logObject.send(embed).catch(discordErrorHandler);
		msg.react(Emojis.yes).catch(discordErrorHandler);
	},
	aliases: ["unmute"],
	syntaxes: ["@users..."],
	description: "Desmuta um ou mais membros.",
	help: "Desmuta um ou mais membros.",
	examples: ["@NoNe"],
	permissions: Permission.MOD
}