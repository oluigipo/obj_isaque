import { Command, Arguments, Permission, discordErrorHandler, ArgumentKind, Roles } from "../../defs";
import { Message } from "discord.js";
import { eventPoint } from "../../balance";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (!msg.member?.roles.cache.has(Roles.gamemaster) && !msg.member?.permissions.has("ADMINISTRATOR"))
			return;

		if (args.length < 2) {
			msg.reply("quem?").catch(discordErrorHandler);
			return;
		}

		let user: string;
		if (args[1].kind === ArgumentKind.MEMBER)
			user = args[1].value.user.id;
		else if (args[1].kind === ArgumentKind.USERID)
			user = args[1].value;
		else {
			msg.reply("isso não é um usuário válido").catch(discordErrorHandler);
			return;
		}

		let qnt = 1;
		if (args.length > 2 && args[2].kind === ArgumentKind.NUMBER)
			qnt = args[2].value;

		const res = eventPoint(user, qnt);
		if (!res.success) {
			msg.reply(res.error).catch(discordErrorHandler);
			return;
		}

		msg.channel.send(`<@${user}> Marcou ponto e está com \`${res.data}\` ponto!`).catch(discordErrorHandler);
	},
	aliases: ["point", "ponto", "pontuar"],
	syntaxes: ["<user>"],
	description: "Dá um ponto pra um usuário.",
	help: "Dá um ponto para um usuário. Só pode ser usado pelo GameMaster ou um Mod.",
	examples: ["@luigipo"],
	permissions: Permission.NONE
}