import { Command, Arguments, Permission, discordErrorHandler, ArgumentKind, Emojis, Time } from "../../defs";
import { Message, CollectorFilter } from "discord.js";

enum Place { X, O, NONE };
type Table = [[Place, Place, Place], [Place, Place, Place], [Place, Place, Place]];

const house = ['❌', '⭕'];
const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

const emptyState = (): Table => [[Place.NONE, Place.NONE, Place.NONE], [Place.NONE, Place.NONE, Place.NONE], [Place.NONE, Place.NONE, Place.NONE]];

interface GameSession {
	player1: string;
	player2: string;
	turn: boolean;
	state: Table;
}

let sessions = <GameSession[]>[];
const winPatterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

function matchPattern(table: Table, pattern: number[], place: Place) {
	for (let i = 0; i < pattern.length; i++) {
		const n = pattern[i];

		const x = n % 3;
		const y = Math.floor(n / 3);

		if (table[y][x] !== place) return false;
	}

	return true;
}

function checkWin(table: Table, place: Place): boolean {
	return winPatterns.some(p => matchPattern(table, p, place));
}

function tableToString(table: Table): string {
	let str = "";

	for (let y = 0; y < table.length; y++) {
		for (let x = 0; x < table[y].length; x++) {
			str += house[table[y][x]] ?? numbers[x + y * table.length];
		}

		str += '\n';
	}

	return str;
}

function sessionToString(s: GameSession): string {
	return `<@${(s.turn) ? s.player2 : s.player1}>\n${tableToString(s.state)}`;
}

enum Result { NONE, ALREADY_SELECTED, INVALID_PLACE, INVALID_TURN, WIN_X, WIN_O };
function processSession(session: GameSession, userid: string, input: number): Result {
	if ((session.turn ? session.player2 : session.player1) !== userid) {
		return Result.INVALID_TURN;
	}

	input = Math.floor(input);
	if (input < 1 || input > 9) {
		return Result.INVALID_PLACE;
	}

	--input; // start from 0

	const x = input % 3;
	const y = Math.floor(input / 3);

	if (session.state[y][x] !== Place.NONE) {
		return Result.ALREADY_SELECTED;
	}

	const turn = session.turn;
	session.turn = !session.turn;

	const p = turn ? Place.O : Place.X;
	session.state[y][x] = p;
	if (checkWin(session.state, p)) {
		return turn ? Result.WIN_O : Result.WIN_X;
	}

	return Result.NONE;
}

function sessionOf(id: string) {
	return sessions.findIndex(g => g.player1 === id || g.player2 === id);
}

function createSession(id1: string, id2: string) {
	let result = <GameSession>{};

	result.state = emptyState();
	result.turn = (Math.random() < 0.5);
	result.player1 = id1;
	result.player2 = id2;

	return result;
}

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (args.length < 2) {
			msg.reply("vê o help").catch(discordErrorHandler);
			return;
		}

		const i = sessionOf(msg.author.id);
		switch (args[1].kind) {
			case ArgumentKind.MEMBER:
				if (i !== -1) {
					const p = (sessions[i].player1 === msg.author.id) ? sessions[i].player2 : sessions[i].player1;
					msg.reply(`Você já está em um jogo com <@${p}}>`).catch(discordErrorHandler);
					return;
				}

				const other = args[1].value;
				msg.react(Emojis.yes).then(() => {
					const filter: CollectorFilter = (reaction, user) => reaction.emoji.name === Emojis.yes && user.id === other.id;

					msg.awaitReactions(filter, { maxUsers: 1, time: Time.minute * 3 }).then(reactions => {
						const reaction = reactions.first();

						if (!reaction)
							return;

						let j = sessions.push(createSession(msg.author.id, other.id));
						msg.channel.send(sessionToString(sessions[j - 1]))
							.catch(discordErrorHandler);
					}).catch(discordErrorHandler);

				}).catch(discordErrorHandler);

				break;
			case ArgumentKind.NUMBER:
				if (i === -1) {
					msg.reply("você não está em uma partida").catch(discordErrorHandler);
					return;
				}

				const result = processSession(sessions[i], msg.author.id, args[1].value);
				switch (result) {
					case Result.NONE:
						msg.channel.send(sessionToString(sessions[i])).catch(discordErrorHandler);
						break;
					case Result.WIN_O:
						msg.channel.send(`Parabéns, <@${sessions[i].player2}>!\n${tableToString(sessions[i].state)}`).catch(discordErrorHandler);
						sessions = sessions.filter((_, ii) => ii !== i);
						break;
					case Result.WIN_X:
						msg.channel.send(`Parabéns, <@${sessions[i].player1}>!\n${tableToString(sessions[i].state)}`).catch(discordErrorHandler);
						sessions = sessions.filter((_, ii) => ii !== i);
						break;
					case Result.ALREADY_SELECTED:
						msg.reply("essa posição já foi marcada").catch(discordErrorHandler);
						break;
					case Result.INVALID_PLACE:
						msg.reply("essa posição é inválida").catch(discordErrorHandler);
						break;
					case Result.INVALID_TURN:
						msg.reply("não é a sua vez").catch(discordErrorHandler);
						break;
				}
				break;
			default:
				msg.reply("você viu o help?").catch(discordErrorHandler);
				break;
		}
	},
	aliases: ["tic-tac-toe", "ttt", "velha"],
	syntaxes: ["<@user>", "<number>"],
	description: "Jogue Tic-Tac-Toe para passar o tempo!",
	help: "Use esse comando marcando um membro para convidá-lo para uma partida. O mesmo terá 3 minutos para aceitá-la (clicar na reação)\n" +
		"Quando for sua vez, use o comando com o número da casa que você quer marcar.",
	examples: ["@dino"],
	permissions: Permission.SHITPOST
}