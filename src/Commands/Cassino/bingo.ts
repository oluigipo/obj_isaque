import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";
import { bingoCurrent, Bingo } from "../../Cassino/bingo";
import Moderation from "../../Moderation";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (typeof (bingoCurrent) !== 'number') {
			bingoCurrent.checkWin = msg.author.id;
		} else {
			if (!Moderation.isAdmin(msg.member)) return;
			if (args.length < 4) {
				msg.channel.send(`${msg.author} Sintaxe incorreta!`);
				return;
			}

			const timeToRun = Number(args[1]);
			if (timeToRun === NaN || timeToRun < 0) {
				msg.channel.send(`${msg.author} Tempo incorreto!`);
				return;
			}

			const size = Number(args[2]);
			if (size === NaN || size < 1) {
				msg.channel.send(`${msg.author} Tamanho da cartela incorreta!`);
				return;
			}

			const prize = Number(args[3]);
			if (prize === NaN || prize < 5) {
				msg.channel.send(`${msg.author} Valor do prêmio incorreto!`);
				return;
			}

			Bingo.setCurrent(new Bingo(msg, timeToRun, size, prize));
		}
	},
	permissions: Permission.Shitpost | Permission.Cassino,
	aliases: ["bingo"],
	shortHelp: "Inicie uma partida de bingo",
	longHelp: "Inicie uma partida de bingo. Para ganhar é necessário fazer uma linha ou uma coluna",
	example: `${Server.prefix}bingo tempoAtéComeçar tamanhoDaTabela premio`
};