import { Command, Argument, Permission, ArgumentKind } from "../index";
import Discord from "discord.js";
import * as Balance from "../../balance";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Discord.Message, args: Argument[], raw: string[]) {
		if (!msg.member?.roles.cache.has(Common.ROLES.gamemaster) && !msg.member?.permissions.has(Discord.PermissionsBitField.Flags.Administrator))
			return;

		if (args.length < 2) {
			msg.reply("quem?").catch(Common.discordErrorHandler);
			return;
		}

		let user: string;
		if (args[1].kind === ArgumentKind.MEMBER)
			user = args[1].value.user.id;
		else if (args[1].kind === ArgumentKind.USERID)
			user = args[1].value;
		else {
			msg.reply("isso não é um usuário válido").catch(Common.discordErrorHandler);
			return;
		}

		let qnt = 1;
		if (args.length > 2 && args[2].kind === ArgumentKind.NUMBER)
			qnt = args[2].value;

		const res = Balance.eventPoint(user, qnt);
		if (!res.ok) {
			msg.reply(res.error).catch(Common.discordErrorHandler);
			return;
		}

		msg.channel.send(`<@${user}> Marcou ponto e está com \`${res.data}\` ponto!`).catch(Common.discordErrorHandler);
	},
	aliases: ["point", "ponto", "pontuar"],
	syntaxes: ["<user>"],
	description: "Dá um ponto pra um usuário.",
	help: "Dá um ponto para um usuário. Só pode ser usado pelo GameMaster ou um Mod.",
	examples: ["@luigipo"],
	permissions: Permission.NONE
}
