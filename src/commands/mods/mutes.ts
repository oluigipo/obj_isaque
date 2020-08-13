import { Command, Arguments, Permission, MsgTemplates, ArgumentKind, formatTime, Emojis, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";
import * as Moderation from "../../moderation";

export default <Command>{
	async run(msg: Message, args: Arguments) {
		let list = Moderation.formatedMuteList();
		if (list === "")
			list = "não tem nenhum doido mutado";
		msg.channel.send(list).catch(discordErrorHandler);
	},
	aliases: ["mutes", "mutados"],
	description: "Lista de membros mutados.",
	help: "Lista de membros mutados.",
	permissions: Permission.MOD,
	syntaxes: [""],
	examples: []
}