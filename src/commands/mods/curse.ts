import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";
import * as Moderation from "../../moderation";

export default <Command>{
	async run(msg: Message<true>, args: Argument[], raw: string[]) {
		if (args.length > 1 && args[1].kind == ArgumentKind.STRING) {
			Moderation.curseInvite(args[1].value);
			msg.react(Common.EMOJIS.yes).catch(Common.discordErrorHandler);
		} else {
			msg.reply("me diz o invite").catch(Common.discordErrorHandler);
		}
	},
	aliases: ["curse"],
	syntaxes: ["<invite code>"],
	description: "Amaldiçoa um invite! Use!",
	help: "Amaldiçoa um invite! Todos os usuários que entrarem usando ele serão banidos.",
	examples: ["noneclass (não faça isso)"],
	permissions: Permission.MOD
}