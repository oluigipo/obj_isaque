import { Command, Arguments, Server, Permission, Emojis, Time } from "../../definitions";
import { Message, MessageReaction, User } from "discord.js";
import { getUser, getCompany, companyLeave } from "../../Shop";

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
		if (company.members[0] === user.id) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} Você não pode sair de uma empresa que você tem posse!`);
			return;
		}

		msg.channel.send(`🛑 **|** ${msg.author} Você está prestes a sair da empresa **${company.name}**, você confirma essa ação? (Esta ação expirará depois de 5 minutos)`)
			.then(ms => {
				const m = <Message>ms;

				m.react(Emojis.yes);
				m.awaitReactions((reaction: MessageReaction, user: User) => reaction.emoji.name === Emojis.yes && user.id === msg.author.id, { time: Time.minute * 5, max: 1 })
					.then(v => {
						if (v.size === 0) return;

						companyLeave(msg.author.id);
						msg.channel.send(`${msg.author} Você acaba de sair da sua empresa.`);
					});
			});
	},
	permissions: Permission.None,
	aliases: ["leave"],
	shortHelp: "Saia da empresa que você está!",
	longHelp: "Saia da empresa que você está! Se você for o dono da empresa, você tem duas opções: dar a posse da empresa para outra pessoa e sair ou deletar a sua empresa!",
	example: `${Server.prefix}shop leave`
};