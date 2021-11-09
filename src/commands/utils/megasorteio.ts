// @NOTE(luigi): still checkin

import { Command, Arguments, Server, Permission, Time, formatTime, defaultEmbed, notNull, ArgumentKind, discordErrorHandler, defaultErrorHandler, Roles } from "../../defs";
import { Message, User, MessageReaction, Role } from "discord.js";
import * as Giveaway from "../../giveaway.js";

export default <Command>{
	async run(msg: Message, args: Arguments) {
		if (args.length < 4) {
			msg.reply(`Informações insuficientes! \`${Server.prefix}megasorteio <tempo> <quantidade> <prêmio>\``)
				.catch(discordErrorHandler);
			return;
		}
		args.shift();

		let role: Role | undefined;
		if (args[0].kind == ArgumentKind.ROLE) {
			role = args[0].value;
			args.shift();
		}

		if (args[0].kind !== ArgumentKind.TIME) {
			msg.reply(`${args[0].value.toString()} não serve. Me diga um tempo válido`)
				.catch(discordErrorHandler);
			return;
		}
		const duration = args[0].value;

		if (args[1].kind !== ArgumentKind.NUMBER) {
			msg.reply(`me diz a quantidade de vencedores que vai ter, mesmo que seja só 1`)
				.catch(discordErrorHandler);
			return;
		}
		const qnt = args[1].value;

		let everton = false;
		const premio = args.slice(2).reduce((arr, arg) => (arr.push(arg.value.toString()), arr), <string[]>[]).join(' ');
		let message = <Message>await msg.channel.send("...").catch(discordErrorHandler);

		async function update() {
			await message.react('🔘').catch(discordErrorHandler);
			await message.react('❌').catch(discordErrorHandler);
			await message.react('✅').catch(discordErrorHandler);

			let confirmacao = defaultEmbed(notNull(msg.member));

			confirmacao.title = `MegaSorteio!`;
			confirmacao.description = `Veja as opções dos prêmios a seguir (Clique nas reações para trocar as opções):`;

			confirmacao.addField("Prêmio", premio, true);
			confirmacao.addField("Organizador(a)", msg.author, true);
			confirmacao.addField("Quantidade de vencedores", qnt, true);
			confirmacao.addField("Opções", `🔘 Marcar everyone: ${everton ? "Ativado" : "Desativado"}\n❌ Cancelar MegaSorteio\n✅ Iniciar MegaSorteio`);

			await message.edit(confirmacao).catch(discordErrorHandler);
			async function __aee() {
				message.awaitReactions((reaction: MessageReaction, user: User) => ['🔘', '❌', '✅'].includes(reaction.emoji.name) && user.id === msg.author.id, { maxUsers: 1 })
					.then((elements) => {
						let reaction = elements.first();
						if (reaction === void 0) return __aee();

						switch (reaction.emoji.name) {
							case '🔘':
								everton = !everton;
								message.reactions.removeAll();
								update();
								break;
							case '❌':
								message.delete();
								msg.channel.send(`${msg.author} Sorteio Cancelado!`);
								break;
							case '✅':
								let final = defaultEmbed(notNull(msg.member));
								final.title = "MegaSorteio!";
								final.description = `Para participar, reaja com ✅ nessa mensagem!`;

								if (role)
									final.addField("IMPORTANTE", `Apenas membros com o cargo ${role} podem participar!`);

								final.addField("Prêmio", `${qnt} ${premio}`, true);
								final.addField("Organizador(a)", msg.author.toString(), true);
								final.addField("Duração", formatTime(duration), true);

								message.delete();

								msg.channel.send("MegaSorteio!" + (everton ? " @everyone" : ""), final)
									.then((mess) => {
										mess.react('✅');

										Giveaway.createGiveaway(mess.id, duration, qnt, premio, role?.id, mess.channel.id);

										return;
										// mess.awaitReactions((reaction: MessageReaction, user: User) => (reaction.emoji.name === '✅' && !user.bot), { time: opcoes.duracao })
										// 	.then((el) => {
										// 		let arr = el.first()?.users.cache.array().filter(u => !u.bot && msg.guild?.member(u)?.roles.cache.has(opcoes.role?.id ?? Roles.community));
										// 		if (arr === undefined) {
										// 			msg.channel.send("ninguém participou do sorteio " + "<:life:746046636743983134>".repeat(4));
										// 			return;
										// 		}
										// 		let winners = <User[]>[];

										// 		if (arr.length <= opcoes.qnt) {
										// 			winners = arr;
										// 		} else {
										// 			do {
										// 				let w: User;
										// 				do {
										// 					w = arr[Math.floor(Math.random() * arr.length)];
										// 				} while (winners.includes(w));

										// 				winners.push(w);
										// 			} while (winners.length < opcoes.qnt);
										// 		}

										// 		mess.delete().catch(discordErrorHandler);
										// 		msg.channel.send(`O MegaSorteio acabou! Os seguintes usuários ganharam \`${premio}\`:\n${winners.reduce((s, c) => s + `\n${c}`, "")}`)
										// 			.catch(discordErrorHandler);
										// 	}).catch(discordErrorHandler);
									}).catch(discordErrorHandler);
								break;
						}
					}).catch(discordErrorHandler);
			}

			await __aee().catch(defaultErrorHandler);
		}

		await update().catch(defaultErrorHandler);
	},
	syntaxes: ["[cargo] <tempo> <quantidade> <prêmio...>"],
	permissions: Permission.MOD,
	aliases: ["megasorteio"],
	description: "Iniciar um Mega Sorteio!",
	help: "Um Mega Sorteio consiste em um Prêmio",
	examples: [`10m 5 abraços do gabe`]
};