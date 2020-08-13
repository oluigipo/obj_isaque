import { Command, Arguments, Permission, MsgTemplates, ArgumentKind, formatTime, Emojis, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";
import * as Moderation from "../../moderation";

export default <Command>{
	async run(msg: Message, args: Arguments) {
		if (args.length < 2) {
			msg.reply("mutar quem?").catch(discordErrorHandler);
			return;
		}
		args.shift(); // consume command

		let duration = -1;
		let finalmsg = "";
		for (const arg of args) {
			switch (arg.kind) {
				case ArgumentKind.MEMBER: {
					const member = arg.value;
					// @NOTE(luigi): we don't need to update the db every iteration of the loop
					const result = Moderation.weakmute(member.id, duration, arg.value);

					if (!result.success) {
						finalmsg += `Algo deu errado ao mutar <@${member.id}>. \`${result.error}\`\n`;
						continue;
					}

					finalmsg += `Sinta o peso do mute <@${member}>! Mutado `;
					if (duration === -1)
						finalmsg += `até alguém quiser te desmutar.`;
					else
						finalmsg += `por \`${formatTime(duration)}\`.`;

					if (result.warning)
						finalmsg += ` Nota: ${result.warning}`;

					finalmsg += '\n';
				} break;
				case ArgumentKind.TIME:
					duration = arg.value;
					break;
			}
		}

		if (finalmsg === "")
			finalmsg = "mutar quem?";
		else {
			// update the db if someone was muted
			Moderation.updateDB();
			if (finalmsg.length >= 2000)
				finalmsg = `caraca, mutou tanta gente que passou do limite de 2000 caracteres do discord ${Emojis.surrender.repeat(3)}`
		}

		msg.channel.send(finalmsg).catch(discordErrorHandler);
	},
	aliases: ["mute", "mutar"],
	description: "Muta um ou mais membros por um tempo (in)determinado.",
	help: "Muta um ou mais membros por um tempo (in)determinado.",
	permissions: Permission.MOD,
	syntaxes: ["[tempo...] @user..."],
	examples: ["3h @usuario", "365d @SG @Urlake"]
}