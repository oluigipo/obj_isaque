import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";
import { Sorteio, currentSorteio } from "../../Cassino/sorteio";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (currentSorteio) {
			msg.channel.send(`${msg.author} Já existe um sorteio rolando!`);
			return;
		}
		if (args.length < 3) {
			msg.channel.send(`${msg.author} É necessário dizer quanto dinheiro será sorteado e quanto tempo durará (em segundos) este sorteio!`);
			return;
		}

		const qnt = Number(args[1]);
		if (isNaN(qnt) || qnt <= 0 || qnt !== Math.trunc(qnt)) {
			msg.channel.send(`${msg.author} Quantidade inválida.`);
			return;
		}
		const time = Number(args[2]) * 1000;
		if (isNaN(time) || time <= 0 || time !== Math.trunc(time)) {
			msg.channel.send(`${msg.author} Duração inválida.`);
			return;
		}

		Sorteio(msg, qnt, time);
	},
	permissions: Permission.Staff,
	aliases: ["sorteio"],
	shortHelp: "Inicie um sorteio",
	longHelp: "Inicie um sorteio! Um sorteio consiste em entregar uma quantidade de dinheiro (que veio do nada) para algum membro aleatório que reagir a sua mensagem",
	example: `${Server.prefix}sorteio quantidade duraçãoEmSegundos`
};