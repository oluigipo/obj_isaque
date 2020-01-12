import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";
import { Bank } from "../../Cassino";

export default <Command>{
	run: (msg: Message, args: Arguments) => {
		if (args.length < 3) {
			msg.channel.send(`${msg.author} Sintaxe inválida. Consulte o \`!!help\`.`);
			return;
		}
		const member = msg.mentions.members.first();
		if (member === undefined) {
			msg.channel.send(`${msg.author} Usuário inválido.`);
			return;
		}

		const qnt = Number(args[1]);
		if (isNaN(qnt) || qnt <= 0 || qnt !== Math.trunc(qnt)) {
			msg.channel.send(`${msg.author} Valor inválido.`);
			return;
		}

		if (member.id === msg.author.id) {
			msg.channel.send(`${msg.author} Você tem algum problema por acaso?`);
			return;
		}

		const result = Bank.transfer(msg.author.id, member.id, qnt);

		switch (result) {
			case -2: msg.channel.send(`${msg.author} Usuário inválido.`); break;
			case -1: msg.channel.send(`${msg.author} Você não está registrado!`); break;
			case 0: msg.channel.send(`${msg.author} Você não tem dinheiro o suficiente!`); break;
			case 1: msg.channel.send(`${msg.author} Você transferiu \`${qnt}\` para ${member.user.tag}!`); break;
		}
	},
	permissions: Permission.Shitpost | Permission.Cassino,
	aliases: ["transfer", "transferir"],
	shortHelp: "Transfira dinheiro para outro usuário",
	longHelp: "Transfira dinheiro para outro usuário",
	example: `${Server.prefix}transfer quantidade @member`
};