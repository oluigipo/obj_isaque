import { Command, Arguments, Server, formatDate, Permission } from "../../definitions";
import { Message } from "discord.js";
import { Bank } from "../../Cassino";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		const result = Bank.mendigar(msg.author.id);
		if (result === null) {
			msg.channel.send(`${msg.author} Você não está registrado.`);
		} else if (result < 0) {
			msg.channel.send(`${msg.author} Você só poderá mendigar de novo depois de ${formatDate(-result)}!`);
		} else if (result === 0) {
			msg.channel.send(`${msg.author} Infelizmente ninguém quis te doar nada.`);
		} else {
			msg.channel.send(`${msg.author} Parabéns! Alguém te doou \`$${result}\`!`);
		}
	},
	permissions: Permission.Shitpost | Permission.Cassino,
	aliases: ["mendigar"],
	shortHelp: "Está com pouca grana? Não se preocupe, pois este comando existe para te ajudar",
	longHelp: "Mendigue um pouco de dinheiro. Vai que alguém te dá algo. Obs.: Você só pode mendigar uma vez por dia",
	example: `${Server.prefix}mendigar`
};