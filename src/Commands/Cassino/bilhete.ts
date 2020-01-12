import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";
import Loteria from "../../Cassino/loteria";

export default <Command>{
	run: (msg: Message, args: Arguments) => {
		if (Loteria.currentLoteria === -1) {
			msg.channel.send(`${msg.author} Não existe nenhuma loteria iniciada!`);
			return;
		}
		if (args.length < 2) {
			msg.channel.send(`${msg.author} Informe quantos bilhetes deseja comprar. Esta é uma compra única!`);
			return;
		}

		const qnt = Number(args[1]);
		if (isNaN(qnt) || qnt <= 0 || qnt !== Math.trunc(qnt)) {
			msg.channel.send(`${msg.author} Quantidade de bilhetes inválida.`);
			return;
		}
		const result = typeof Loteria.currentLoteria !== 'number' ? Loteria.currentLoteria.bilhete(msg.author.id, qnt) : 0;
		if (result < 0) {
			msg.channel.send(`${msg.author} Você não está registrado ou já usou o \`${Server.prefix}bilhete\` antes!`);
		} else if (result === 0) {
			msg.channel.send(`${msg.author} Infelizmente você não pôde comprar nenhum bilhete. <:Zgatotristepo:589449862697975868>`);
		} else if (result < qnt) {
			msg.channel.send(`${msg.author} Infelizmente você não havia dinheiro suficiente para comprar esta quantidade de bilhetes. Então você acabou comprando somente ${result}.`);
		} else {
			msg.channel.send(`${msg.author} Você comprou ${qnt} bilhete(s). Boa sorte!`);
		}
	},
	permissions: Permission.Shitpost | Permission.Cassino,
	aliases: ["bilhete"],
	shortHelp: "Compre bilhetes para participar da loteria. Quanto mais você compra, maiores as suas chances",
	longHelp: "Compre biletes para participar da loteria. Quantos mais você comprar, maiores as suas chances de vencer.",
	example: `${Server.prefix}bilhete quantidade`
};