import { Command, Arguments, Server, Permission } from "../../definitions";
import Moderation from "./../../Moderation";
import { Message } from "discord.js";
import { Bank } from "../../Cassino";

export default <Command>{
	run: (msg: Message, args: Arguments) => {
		if (args.length < 3) {
			msg.channel.send(`${msg.author} Informe o usuário que deseja punir e quanto deseja descontar dele.`);
			return;
		}
		const qnt = Number(args[1]);
		if (isNaN(qnt) || qnt !== Math.trunc(qnt)) {
			msg.channel.send(`${msg.author} Quantidade inválida.`);
			return;
		}

		msg.mentions.members.forEach(m => {
			if (Moderation.isAdmin(m)) return;
			const result = Bank.userPunish(m.id, qnt);
			if (result) {
				msg.channel.send(`${msg.author} O usuário ${m.user.tag} foi punido com sucesso.`);
			} else {
				msg.channel.send(`${msg.author} Não foi possível punir o usuário ${m.user.tag}. Talvez ele não esteja registrado ainda!`);
			}
		});
	},
	permissions: Permission.Staff,
	aliases: ["punish", "punir"],
	shortHelp: "Puna um membro confiscando parte de seu dinheiro",
	longHelp: "Puna um membro confiscando um pouco de seu dinheiro (ou todo seu dinheiro :kappa:)",
	example: `${Server.prefix}punish quantidade @membro`
};