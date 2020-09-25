import { Command, Arguments, Permission, ArgumentKind, cursedInvites, discordErrorHandler, Emojis } from "../../defs";
import { Message } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (args.length > 1 && args[1].kind == ArgumentKind.STRING) {
			Object.assign(cursedInvites,
				cursedInvites.filter(invite => invite !== args[1].value)
			);
			msg.react(Emojis.yes).catch(discordErrorHandler);
		} else {
			msg.reply("me diz o invite").catch(discordErrorHandler);
		}
	},
	aliases: ["curse"],
	syntaxes: ["<invite code>"],
	description: "Amaldiçoa um invite! Use!",
	help: "Amaldiçoa um invite! Todos os usuários que entrarem usando ele serão banidos.",
	examples: ["noneclass (não faça isso)"],
	permissions: Permission.MOD
}