import { Command, Arguments, Server, Permission, Time } from "../../definitions";
import { Message, RichEmbed, User, MessageReaction } from "discord.js";

export default <Command>{
	run: async (msg: Message, args: Arguments) => {
		if (args.length < 4) {
			msg.channel.send(`${msg.author} Informações insuficientes! \`${Server.prefix}megasorteio <tempo> <quantidade> <prêmio>\``);
			return;
		}

		let duration = -1;
		let _t: number;
		let _d: string;
		if (args.length > 2 && args[1][0] !== '<') {
			_t = parseInt(args[1]);
			_d = args[1][String(_t).length];

			duration = 1;
			switch (_d) {
				case 'w': duration *= 7;
				case 'd': duration *= 24;
				case 'h': duration *= 60;
				case 'm': duration *= 60;
				case 's': break;
				default:
					msg.channel.send(`${_t + _d} não é uma duração válida`);
					return;
			}

			duration *= _t;
			duration *= 1000;
		}

		if (isNaN(duration)) {
			msg.channel.send(`${msg.author} Tempo inválido!`);
			return;
		}

		let opcoes = {
			everton: false,
			qnt: Number(args[2]),
			duracao: duration
		};

		if (isNaN(opcoes.qnt) || opcoes.qnt < 1 || Math.abs(opcoes.qnt) === Infinity) {
			msg.channel.send(`${msg.author} Quantidade de Vencedores inválida!`);
			return;
		}

		const premio = args.slice(3).join(' ');
		let message = await msg.channel.send("...");

		await message.react('🔘');
		await message.react('❌');
		await message.react('✅');

		async function update() {
			let confirmacao = new RichEmbed();

			confirmacao.color = Server.botcolor;
			confirmacao.author = { name: msg.member.displayName, icon_url: msg.author.avatarURL };
			confirmacao.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };

			confirmacao.title = `MegaSorteio!`;
			confirmacao.description = `Veja as opções dos prêmios a seguir (Clique nas reações para trocar as opções):`;

			confirmacao.addField("Prêmio", premio, true);
			confirmacao.addField("Organizador(a)", msg.author, true);
			confirmacao.addField("Quantidade de vencedores", opcoes.qnt, true);
			confirmacao.addField("Opções", `🔘 Marcar everyone: ${opcoes.everton ? "Ativado" : "Desativado"}\n❌ Cancelar MegaSorteio\n✅ Iniciar MegaSorteio`);

			await message.edit(confirmacao);
			async function __aee() {
				message.awaitReactions((reaction: MessageReaction, user: User) => ['🔘', '❌', '✅'].includes(reaction.emoji.name) && user.id === msg.author.id, { max: 1 })
					.then((elements) => {
						let reaction = elements.first();
						if (reaction === void 0) return __aee();;

						switch (reaction.emoji.name) {
							case '🔘':
								opcoes.everton = !opcoes.everton;
								reaction.remove(msg.author);
								update();
								break;
							case '❌':
								message.delete();
								msg.channel.send(`${msg.author} Sorteio Cancelado!`);
								break;
							case '✅':
								let final = new RichEmbed();

								final.color = Server.botcolor;
								final.author = { name: msg.member.displayName, icon_url: msg.author.avatarURL };
								final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };
								final.title = "MegaSorteio!";
								final.description = `Para participar, reaja com ✅ nessa mensagem!`;
								final.addField("Prêmio", premio, true);
								final.addField("Organizador(a)", msg.author, true);
								final.addField("Quantidade de vencedores", opcoes.qnt, true);

								message.delete();
								msg.channel.send("MegaSorteio!" + (opcoes.everton ? " @everyone" : ""), final)
									.then((mess) => {
										mess.react('✅');
										mess.awaitReactions((reaction: MessageReaction, user: User) => reaction.emoji.name === '✅' && !user.bot, { time: opcoes.duracao })
											.then((el) => {
												let arr = el.first().users.array().filter(u => !u.bot);
												let winners = <User[]>[];

												if (arr.length <= opcoes.qnt) {
													winners = arr;
												} else {
													do {
														let w: User;
														do {
															w = arr[Math.floor(Math.random() * arr.length)];
														} while (winners.includes(w));

														winners.push(w);
													} while (winners.length < opcoes.qnt);
												}

												mess.delete();
												msg.channel.send(`O MegaSorteio acabou! Os seguintes usuários ganharam \`${premio}\`:\n${winners.reduce((s, c) => s + `\n${c}`, "")}`);
											});
									});
								break;
						}
					});
			}

			await __aee();
		}

		await update();
	},
	permissions: Permission.Staff,
	aliases: ["megasorteio"],
	shortHelp: "Iniciar um Mega Sorteio!",
	longHelp: "Um Mega Sorteio consiste em um Prêmio",
	example: `${Server.prefix}megasorteio <tempo> <quantidade> <prêmio>`
};