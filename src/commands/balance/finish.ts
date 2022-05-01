import { Command, Argument, Permission } from "../index";
import { Message, Permissions } from "discord.js";
import * as Balance from "../../balance";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (!msg.member?.roles.cache.has(Common.ROLES.gamemaster) && !msg.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
			return;

		const result = Balance.finishEvent();
		if (!result.ok) {
			if (result.extra) {
				msg.channel.send(`Temos um empate! Vencedores: ${result.extra.reduce((acc, val) => acc + `<@${val}> `, "")}`)
					.catch(Common.discordErrorHandler);
			} else {
				msg.reply(result.error).catch(Common.discordErrorHandler);
			}

			return;
		}

		msg.guild?.members.fetch().then(members => {
			members.forEach(member => {
				if (member.roles.cache.has(Common.ROLES.event))
					member.roles.remove(Common.ROLES.event);
			});
		});

		msg.channel.send(`Parabéns <@${result.data.user}>! Você ganhou o evento com ${result.data.points} pontos! O prêmio é \`${typeof result.data.prize === "string" ? result.data.prize : `$${result.data.prize}`}\``)
			.catch(Common.discordErrorHandler);
	},
	aliases: ["finish", "terminar"],
	syntaxes: [""],
	description: "Finaliza um evento.",
	help: "Finaliza um evento e anuncia o vencedor!",
	examples: [""],
	permissions: Permission.NONE
}