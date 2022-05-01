import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message, GuildMember } from "discord.js";
import * as Moderation from "../../moderation";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[]) {
		if (args.length < 2) {
			msg.reply("mutar quem?").catch(Common.discordErrorHandler);
			return;
		}
		args.shift(); // consume command

		let finalmsg = `${msg.author}\n`;

		let duration = -1;
		let reasonList: string[] | undefined;
		let toMute: { duration: number, member: GuildMember }[] = [];
		for (const arg of args) {
			if (reasonList)
				reasonList.push(arg.value.toString());

			switch (arg.kind) {
				case ArgumentKind.MEMBER: {
					toMute.push({ duration, member: arg.value });
				} break;
				case ArgumentKind.TIME:
					duration = arg.value;
					break;
				default:
					if (!reasonList)
						reasonList = [arg.value.toString()];
					break;
			}
		}

		const reason = reasonList?.join(' ');

		for (const e of toMute) {
			const member = e.member;
			// @NOTE(luigi): we don't need to update the db every iteration of the loop
			const result = Moderation.weakmute(member.id, e.duration, reason, member);

			if (!result.ok) {
				finalmsg += `Algo deu errado ao mutar ${member}. \`${result.error}\`\n`;
				continue;
			}

			finalmsg += `Sinta o peso do mute ${member}! Mutado `;
			if (e.duration === -1)
				finalmsg += `até alguém quiser desmutar.`;
			else
				finalmsg += `por \`${Common.formatTime(e.duration)}\`.`;

			if (result.warning)
				finalmsg += ` Nota: ${result.warning}`;

			finalmsg += '\n';
		}

		if (finalmsg === "")
			finalmsg = "mutar quem?";
		else {
			// update the db if someone was muted
			Moderation.updateDb();
			if (finalmsg.length >= 2000)
				finalmsg = `caraca, mutou tanta gente que passou do limite de 2000 caracteres do discord ${Common.EMOJIS.surrender.repeat(3)}`
		}

		let embed = Common.emptyEmbed();
		embed.description = finalmsg;
		Moderation.logChannel.send({ embeds: [embed] }).catch(Common.discordErrorHandler);
		msg.react(Common.EMOJIS.yes).catch(Common.discordErrorHandler);
	},
	aliases: ["mute", "mutar"],
	description: "Muta um ou mais membros por um tempo (in)determinado.",
	help: "Muta um ou mais membros por um tempo (in)determinado.",
	permissions: Permission.MOD,
	syntaxes: ["[tempo...] @user..."],
	examples: ["3h @usuario", "365d @SG @Urlake"]
}