import { Command, Arguments, Server, Permission, Time } from "../../definitions";
import { Message, RichEmbed, User, MessageReaction } from "discord.js";

export default <Command>{
	run: async (msg: Message, args: Arguments) => {
		if (args.length < 4) {
			msg.channel.send(`${msg.author} Informações insuficientes! \`${Server.prefix}megasorteio <tempo> <quantidade> <prêmio>\``);
			return;
		}

		let opcoes = {
			everton: false,
			qnt: Number(args[2]),
			duracao: Number(args[1])
		};

		if (isNaN(opcoes.qnt) || opcoes.qnt < 1 || Math.abs(opcoes.qnt) === Infinity) {
			msg.channel.send(`${msg.author} Quantidade de Vencedores inválida!`);
			return;
		}

		const premio = args.slice(2).join(' ');
		let message = await msg.channel.send("...");

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
			message.createReactionCollector((reaction: MessageReaction, user: User) => ['🔘', '❌', '✅'].includes(reaction.emoji.name) && user.id === msg.author.id, { max: 1 })
				.once("collect", (element) => {
					switch (element.emoji.name) {
						case '🔘':
							opcoes.everton = !opcoes.everton;
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

							message.channel.send("MegaSorteio!" + (opcoes.everton ? " @everyone" : ""), final)
								.then((mess) => {
									mess.createReactionCollector((reaction: MessageReaction, user: User) => reaction.emoji.name === '✅' && !user.bot, { time: 10 })
										.once("collect", (el) => {
											let arr = el.users.array();
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

											msg.channel.send(`O MegaSorteio acabou! Os vencedores são:\n${winners.reduce((s, c, i) => s + `\n\`${i + 1} - \` ${c}`, "")}`);
										});
								});
							break;
					}
				});
		}

		await update();
	},
	permissions: Permission.Staff,
	aliases: ["megasorteio"],
	shortHelp: "Iniciar um Mega Sorteio!",
	longHelp: "Um Mega Sorteio consiste em um Prêmio",
	example: `${Server.prefix}megasorteio <tempo> <quantidade> <prêmio>`
};