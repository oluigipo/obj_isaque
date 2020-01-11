import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";
import Moderation from "../../Moderation";
import Loteria from "../../Cassino/loteria";

export default <Command>{
	run: (msg: Message, args: Arguments) => {
		if (!Moderation.isAdmin(msg.member)) return;
		if (Loteria.currentLoteria === -1) {
			msg.channel.send(`${msg.author} Não existe nenhuma loteria iniciada!`);
			return;
		}

		const result = <{ money: number, user: string } | undefined>Loteria.currentLoteria.resultado();
		if (result === undefined) {
			msg.channel.send(`${msg.author} Loteria encerrada com 0 participantes!`);
			Loteria.currentLoteria = -1;
			return;
		}

		msg.channel.send(`Parabéns, <@${result.user}>! Você acaba de ganhar \`$${result.money}\`!`);
		msg.channel.send(`Obrigado a todos os outros membros que participaram dessa loteria! Boa sorte na próxima para os outros participantes.`);
		Loteria.currentLoteria = -1;
	},
	permissions: Permission.Staff,
	aliases: ["resultado", "result"],
	shortHelp: "Finalize uma loteria e anuncie o vencedor",
	longHelp: "Finalize uma loteria e revele o resultado",
	example: `${Server.prefix}resultado`
};