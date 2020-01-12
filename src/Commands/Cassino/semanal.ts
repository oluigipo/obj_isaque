import { Command, Arguments, Server, formatDate, Permission } from "../../definitions";
import { Message } from "discord.js";
import { Bank } from "../../Cassino";

export default <Command>{
	run: (msg: Message, args: Arguments) => {
		const result = Bank.weekMoney(msg.author.id);
		if (result === 0) {
			msg.channel.send(`${msg.author} Você não está registrado!`);
		} else if (result < 0) {
			msg.channel.send(`${msg.author} Você ainda não pode resgatar o prêmio semanal! Ainda faltam ${formatDate(-result)}.`);
		} else {
			msg.channel.send(`${msg.author} Você resgatou \`$${result}\``);
		}
	},
	permissions: Permission.Shitpost | Permission.Cassino,
	aliases: ["semanal"],
	shortHelp: "Resgate uma quantidade de dinheiro semanalmente",
	longHelp: "Resgate uma certa quantidade de dinheiro semanalmente",
	example: `${Server.prefix}semanal`
};