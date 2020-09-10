import { Command, Arguments, Permission, MsgTemplates, ArgumentKind, formatTime, Emojis, discordErrorHandler, notNull, defaultEmbed } from "../../defs";
import { Message } from "discord.js";
import * as Moderation from "../../moderation";

export default <Command>{
	async run(msg: Message, args: Arguments) {
		let list = Moderation.getMutes();
		if (list.length === 0) {
			msg.channel.send("não tem nenhum doido mutado").catch(discordErrorHandler);
			return;
		}

		let final = defaultEmbed(notNull(msg.member));

		final.title = "Lista de Mutes";
		final.description = "Lista que contém os nomes de todos os membros amaldiçoados pelo poder do Mute!";

		for (let i = 0; i < list.length; ++i) {
			const mute = list[i];
			final.addField(`Caso nº ${i + 1}`, `Usuário: <@${mute.user}>\nMutado dia: \`${mute.begins}\`\nDuração: \`${mute.duration}\`\nAcaba: \`${mute.ends}\``
				+ (mute.reason ? `\nMotivo: \`${mute.reason}\`` : ""));
		}

		msg.channel.send(final).catch(discordErrorHandler);
	},
	aliases: ["mutes", "mutados"],
	description: "Lista de membros mutados.",
	help: "Lista de membros mutados.",
	permissions: Permission.MOD,
	syntaxes: [""],
	examples: []
}