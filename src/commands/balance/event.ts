import { Command, Arguments, Permission, discordErrorHandler, ArgumentKind, Emojis, Channels, Roles } from "../../defs";
import { CollectorFilter, Message, TextChannel } from "discord.js";
import { beginEvent } from "../../balance";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (args.length < 4) {
			msg.reply("tá faltando argumento pro comando").catch(discordErrorHandler);
			return;
		}

		let mention = false;
		if (args[1].kind === ArgumentKind.STRING && args[1].value === "everyone") {
			args.shift();
			mention = true;
		}

		if (args[1].kind !== ArgumentKind.TIME) {
			msg.reply("isso não é um tempo válido").catch(discordErrorHandler);
			return;
		}

		const time = args[1].value;

		if (args[2].kind !== ArgumentKind.NUMBER) {
			msg.reply("esse custo para participar não é válido").catch(discordErrorHandler);
			return;
		}

		const cost = args[2].value;

		let prize: number | string;
		if (args.length === 4 && args[3].kind === ArgumentKind.NUMBER) {
			prize = args[3].value;
		} else {
			prize = args.slice(3).reduce((acc, arg) => acc + ` ${arg.value}`, "").trim();
		}

		msg.channel.send(`Aperte na reação para participar${mention ? " @everyone" : ""}!`)
			.then(async message => {
				await message.react(Emojis.yes);
				const filter: CollectorFilter = (reaction, user) => reaction.emoji.name === Emojis.yes && !user.bot;

				message.awaitReactions(filter, { time: time }).then(async collected => {
					let users = <string[]>[];

					const reaction = collected.first();
					if (!reaction) {
						msg.reply("rapaz, deu uma coisa errada. Nenhuma reação passou de acordo com o filtro :think");
						return;
					}

					let usersArray = reaction.users.cache.array();

					for (const user of usersArray) {
						const member = await message.guild?.members.fetch(user.id);

						if (member && member.roles.cache.has(Roles.community))
							users.push(user.id);
					}

					const result = beginEvent(message.id, cost, prize, users);
					if (!result.success) {
						msg.reply(`deu coisa errada: \`${result.error}\``);
						return;
					}

					message.channel.send("Evento iniciado!");

					let channel = <TextChannel>msg.guild?.channels.cache.get("671327942420201492");
					if (!channel || channel.type !== "text")
						return;

					const keys = Object.keys(result.data);
					for (const key of keys) {
						let str: string | undefined;

						if (result.data[key] === "NO MONEY")
							str = `<@${key}> Você não possui dinheiro para participar desse evento 😔`;
						else if (result.data[key] === "NOT REGISTERED")
							str = `<@${key}> Você não está registrado`;

						if (str)
							channel.send(str);
						else {
							msg.guild?.members.cache.get(key)?.roles.add(Roles.event);
						}
					}
				});
			})
			.catch(discordErrorHandler);
	},
	aliases: ["event", "evento"],
	syntaxes: ["[everyone?] <tempo para começar> <custo> <prêmio...>"],
	description: "Inicia um evento.",
	help: "Inicia um evento. É só botar `everyone` antes do tempo para ativar a marcação. Se o prêmio for apenas um número, eu vou considerar ele como dinheiro do bot.",
	examples: ["2h 200 Um jogo na steam", "30m 50 200"],
	permissions: Permission.MOD
}