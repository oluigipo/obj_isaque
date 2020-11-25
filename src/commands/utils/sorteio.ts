import { Command, Arguments, Permission, matchArguments, ArgumentKind, defaultEmbed, Emojis, formatTime, discordErrorHandler, Time, notNull, Roles } from "../../defs";
import { GuildMember, Message, MessageReaction, User } from "discord.js";
import { createGiveaway } from "../../giveaway";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (!msg.member)
			return;

		args.shift();
		let duration: number, qnt: number, prize: string, everton = false;

		if (args[0].kind !== ArgumentKind.TIME) {
			msg.reply("tempo inválido").catch(discordErrorHandler);
			return;
		}
		duration = args[0].value;

		if (args[1].kind !== ArgumentKind.NUMBER) {
			msg.reply("quantidade inválida").catch(discordErrorHandler);
			return;
		}
		qnt = args[1].value;

		if (args.length < 3) {
			msg.reply("e qual é o prêmio?").catch(discordErrorHandler);
			return;
		}
		prize = args.slice(2).reduce((acc, arg) => (acc.push(String(arg.value)), acc), <string[]>[]).join(' ');

		let message = <Message>await msg.channel.send("...").catch(discordErrorHandler);

		update();

		async function update() {
			await message.react('🔘').catch(discordErrorHandler);
			await message.react('❌').catch(discordErrorHandler);
			await message.react('✅').catch(discordErrorHandler);

			const embed = defaultEmbed(<GuildMember>msg.member);

			embed.title = "Sorteio: opções";
			embed.title = "Clique nas reações.";

			embed.addField("Prêmio", prize, true);
			embed.addField("Organizador(a)", msg.author, true);
			embed.addField("Quantidade de vencedores", qnt, true);
			embed.addField("Opções", `🔘 Marcar everyone: ${everton ? "Ativado" : "Desativado"}\n❌ Cancelar MegaSorteio\n✅ Iniciar MegaSorteio`);

			await message.edit(embed);

			const filter = (reaction: MessageReaction, user: User) => ['🔘', '❌', '✅'].includes(reaction.emoji.name) && user.id === msg.author.id;
			message.awaitReactions(filter, { maxUsers: 1 })
				.then(reactions => {
					const reaction = reactions.first();

					if (!reaction) {
						return;
					}

					switch (reaction.emoji.name) {
						case '🔘':
							everton = true;
							update();
							break;
						case '❌':
							message.delete();
							msg.channel.send("Sorteio cancelado.").catch(discordErrorHandler);
							break;
						case '✅':
							const embed = defaultEmbed(notNull(msg.member));

							embed.title = "Sorteio!";
							embed.description = `Para participar, reaja com ${Emojis.yes} nessa mensagem!`;
							embed.addField("Organizador(a)", msg.author.toString(), true);
							embed.addField("Duração", formatTime(duration), true);
							embed.addField("Quantidade de Vencedores", qnt, true);
							embed.addField("Prêmio", prize, true);

							msg.channel.send(`Sorteio!${everton ? ` <@&${Roles.community}>` : ""}`, embed)
								.then(message => {
									message.react(Emojis.yes);
									createGiveaway(message.id, duration, qnt, prize);
								})
								.catch(discordErrorHandler);
					}
				})
				.catch(discordErrorHandler);
		}
	},
	aliases: ["sorteio", "giveaway"],
	syntaxes: ["<duração> <quantidade> <prêmio...>"],
	description: "Inicia um sorteio!",
	help: "Inicia um sorteio (evolução do MegaSorteio)!",
	examples: ["1d 3 abraços do gabe"],
	permissions: Permission.MOD
}