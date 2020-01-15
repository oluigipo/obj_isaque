import { Command, Arguments, Server, Permission, Emojis, Time } from "../../definitions";
import { Message, MessageReaction, User } from "discord.js";
import { getUser, getCompany, companyLeave, companyDelete } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		const user = getUser(msg.author.id);
		if (user === void 0) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} Você não tem uma lojinha!`);
			return;
		}

		const company = getCompany(user);
		if (company === void 0) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} Você não está em uma empresa!`);
			return;
		}
		if (company.members[0] !== user.id) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} Você não pode deletar uma empresa que você não tem posse!`);
			return;
		}

		msg.channel.send(`🛑 **|** ${msg.author} Você está prestes a **deletar** da empresa **${company.name}**, você confirma essa ação? (Esta ação expirará depois de 5 minutos)`)
			.then(ms => {
				const m = <Message>ms;

				m.react(Emojis.yes);
				m.awaitReactions((reaction: MessageReaction, user: User) => reaction.emoji.name === Emojis.yes && user.id === msg.author.id, { time: Time.minute * 5, max: 1 })
					.then(v => {
						if (v.size === 0) return;

						companyDelete(msg.author.id);
						msg.channel.send(`${msg.author} Você acaba de fechar a sua empresa.`);
					});
			});
	},
	permissions: Permission.None,
	aliases: ["delete"],
	shortHelp: "Delete a sua empresa!",
	longHelp: "Delete a sua empresa! Esta ação só está disponível para o dono da empresa.",
	example: `${Server.prefix}shop delete`
};