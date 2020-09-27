import { Command, Arguments, Permission, Roles, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";
import { finishEvent } from "../../balance";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (!msg.member?.roles.cache.has(Roles.gamemaster) && !msg.member?.permissions.has("ADMINISTRATOR"))
			return;

		const result = finishEvent();
		if (!result.success) {
			if (result.extra) {
				msg.channel.send(`Temos um empate! Vencedores: ${result.extra.reduce((acc, val) => acc + `<@${val}> `, "")}`)
					.catch(discordErrorHandler);
			} else {
				msg.reply(result.error).catch(discordErrorHandler);
			}

			return;
		}

		msg.guild?.members.fetch().then(members => {
			members.forEach(member => {
				if (member.roles.cache.has(Roles.event))
					member.roles.remove(Roles.event);
			});
		});

		msg.channel.send(`Parabéns <@${result.data.user}>! Você ganhou o evento com ${result.data.points} pontos! O prêmio é \`${typeof result.data.prize === "string" ? result.data.prize : `$${result.data.prize}`}\``)
			.catch(discordErrorHandler);
	},
	aliases: ["finish", "terminar"],
	syntaxes: [""],
	description: "Finaliza um evento.",
	help: "Finaliza um evento e anuncia o vencedor!",
	examples: [""],
	permissions: Permission.NONE
}