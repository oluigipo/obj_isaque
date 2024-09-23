import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message } from "discord.js";
import * as Moderation from "../../moderation";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message<true>, args: Argument[]) {
		let list = Moderation.getMutes();
		if (list.length === 0) {
			msg.channel.send("não tem nenhum doido mutado").catch(Common.discordErrorHandler);
			return;
		}

		let final = Common.defaultEmbed(Common.notNull(msg.member));

		final.title = "Lista de Mutes";
		final.description = "Lista que contém os nomes de todos os membros amaldiçoados pelo poder do Mute!";

		for (let i = 0; i < list.length; ++i) {
			const mute = list[i];
			final.fields.push({
				name: `Caso nº ${i + 1}`,
				value: `Usuário: <@${mute.user}>\nMutado dia: \`${mute.begins}\`\nDuração: \`${mute.duration}\`\nAcaba: \`${mute.ends}\`` + (mute.reason ? `\nMotivo: \`${mute.reason}\`` : ""),
			});
		}

		msg.channel.send({ embeds: [final] }).catch(Common.discordErrorHandler);
	},
	aliases: ["mutes", "mutados"],
	description: "Lista de membros mutados.",
	help: "Lista de membros mutados.",
	permissions: Permission.MOD,
	syntaxes: [""],
	examples: []
}
