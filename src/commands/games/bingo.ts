import { Command, Argument, Permission, validatePermissions } from "../index";
import { Message, MessageReaction, TextChannel, User } from "discord.js";
import * as Common from "../../common";

interface Players {
	[id: string]: number[][];
}

interface Game {
	players: Players;
	played: number[];
	message: Message;
}

const maxNumber = 50;

const numberInRange = () => Math.floor(Math.random() * maxNumber) + 1;

function createTable(size: number) {
	let numbers = new Array<number>(maxNumber).fill(0).map((_, i) => i + 1);

	let result: number[][] = [];

	for (let i = 0; i < size; i++) {
		result[i] = [];

		for (let j = 0; j < size; j++) {
			const n = Math.floor(Math.random() * numbers.length);
			result[i][j] = numbers[n];
			numbers = numbers.filter((_, i) => i !== n);
		}
	}

	return result;
}

let game: Game | undefined;

function generateNumber(played: number[]) {
	if (played.length > maxNumber)
		return -1;

	let n: number;

	do {
		n = numberInRange();
	} while (played.includes(n));

	return n;
}

function processGame() {
	if (!game)
		return;

	const n = generateNumber(game.played);
	if (n === -1)
		return;

	game.played.push(n);

	game.message.edit(`Números jogados (use \`!!bingo\` quando encontrar todos os seus números):\n\`\`\`${game.played.join(' ')}\`\`\``)
		.then(() => {
			setTimeout(processGame, Common.TIME.second * 7);
		})
		.catch(Common.discordErrorHandler);
}

function checkWin(played: number[], table: number[][]): boolean {
	let vCount = new Array<number>(table.length).fill(0);

	for (let i = 0; i < table.length; i++) {
		let hCount = 0;

		for (let j = 0; j < table.length; j++) {
			if (played.includes(table[i][j])) {
				++hCount;
				++vCount[j];
			}
		}

		if (hCount === table.length)
			return true;
	}

	if (vCount.includes(table.length))
		return true;

	return false;
}

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (args.length > 1) { // iniciando um bingo
			if (!validatePermissions(Common.notNull(msg.member), <TextChannel>msg.channel, Permission.MOD))
				return msg.reply("você não tem permissão para iniciar um bingo").catch(Common.discordErrorHandler);

			if (game !== undefined)
				return msg.reply("já tem um bingo rolando (se você está tantando chutar, use esse comando sem argumentos)").catch(Common.discordErrorHandler);

			if (args[1].kind !== "NUMBER")
				return msg.reply("o tamanho da tabela tem que ser um número").catch(Common.discordErrorHandler);

			const tableSize = args[1].value;

			if (tableSize > 7 || tableSize === 0)
				return msg.reply(`o tamanho da tabela tem que estar em [1, 6]`).catch(Common.discordErrorHandler);

			msg.channel.send(`Bingo!\nPressione na reação ${Common.EMOJIS.circle} para participar. O host irá apertar na reação ${Common.EMOJIS.yes} para iniciar!`)
				.then(async message => {
					message.react(Common.EMOJIS.yes).catch(Common.discordErrorHandler);
					message.react(Common.EMOJIS.circle).catch(Common.discordErrorHandler);

					const filter = (reaction: MessageReaction, user: User) => reaction.emoji.name === '✅' && user.id === msg.author.id;

					message.awaitReactions({ filter, maxUsers: 1 }).then(async collected => {
						if (collected.first() === undefined)
							return;

						const reaction = await message.reactions.cache.get(Common.EMOJIS.circle)?.fetch();
						if (!reaction)
							return;

						const users = (await reaction.users.fetch()).filter(user => !user.bot);

						const m = await message.channel.send("...");
						game = { players: {}, played: [], message: m };
						for (const user of users) {
							const table = createTable(tableSize);
							game.players[user[1].id] = table;

							user[1].send(`\`\`\`${table.reduce((acc, val) => acc + `\n${val.reduce((a, v) => a + ` ${v < 10 ? v + " " : v}`, "").trim()}`, "")}\n\`\`\``).catch(Common.discordErrorHandler);
						}

						if (Object.keys(game.players).length < 2) {
							msg.reply("precisa ter no mínimo 2 jogadores para iniciar o bingo").catch(Common.discordErrorHandler);
							game = undefined;
							return;
						}

						setTimeout(processGame, Common.TIME.second * 10);
					}).catch(Common.discordErrorHandler);
				}).catch(Common.discordErrorHandler);

		} else { // fazendo lance
			if (!game)
				return msg.reply("não tem nenhum bingo acontecendo no momento").catch(Common.discordErrorHandler);

			const table = game.players[msg.author.id];
			if (!table)
				return msg.reply("você não está nessa partida de bingo").catch(Common.discordErrorHandler);

			if (checkWin(game.played, table)) {
				game.message.channel.send(`O vencedor é ${msg.author}! Obrigado a todos por participarem!`)
					.catch(Common.discordErrorHandler);

				game = undefined;
			} else {
				msg.reply("tem certeza? acho que não").catch(Common.discordErrorHandler);
			}
		}
	},
	aliases: ["bingo"],
	syntaxes: ["<tamanho da tabela>"],
	description: "Bingo!",
	help: `Inicia uma partida de bingo! Quando o jogo começar, irei mandar sua tabela na sua DM e começarei e botar os números na mensagem.\n\nQuando você fizer bingo (horizontal ou vertical), apenas diga \`${Common.SERVER.prefix}bingo\`!\nObs: O tamanho máximo da tabela é 7.`,
	examples: [],
	permissions: Permission.NONE
}