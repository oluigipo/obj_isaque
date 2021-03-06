// @NOTE(luigi): no revision

/**
 * Este parser é um recursive-descent parser
 */

import { Command, Arguments, Server, Permission, MsgTemplates, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";
import { isUndefined, isNull } from "util";

const rules = [
	{ name: "number_literal_hex", re: /^0x[0-9a-fA-F]+/ },
	{ name: "number_literal", re: /^[0-9]+(\.[0-9]+)?/ },
	{ name: "plus", re: /^\+/ },
	{ name: "minus", re: /^-/ },
	{ name: "not", re: /^~/ },
	{ name: "div", re: /^\// },
	{ name: "pot", re: /^\*\*/ },
	{ name: "mult", re: /^\*/ },
	{ name: "mod", re: /^%/ },
	{ name: "open_p", re: /^\(/ },
	{ name: "close_p", re: /^\)/ },
	{ name: "comma", re: /^,/ },
	{ name: "left", re: /^<</ },
	{ name: "right", re: /^>>/ },
	{ name: "and", re: /^&/ },
	{ name: "or", re: /^\|/ },
	{ name: "xor", re: /^\^/ },
	{ name: "identifier", re: /^[a-zA-Z][a-zA-Z0-9]*/ }
];

function tokenize(source: string): string[] {
	function getToken(str: string): any {
		for (let i = 0; i < rules.length; i++) {
			let result = rules[i].re.exec(str);

			if (result === null) continue;

			return { ...result, i: i };
		}

		return null;
	}

	let tks: string[] = [];
	let count = 0;

	while (count < source.length) {
		let raw = getToken(source.slice(count, source.length));

		if (raw !== null) {
			let tkn = raw[0];
			tks.push(tkn);
			count += tkn.length;
		} else if (source[count] === ' ') count++;
		else throw "Erro de sintaxe!";
	}

	return tks;
}

const functions: any = {
	sin: Math.sin,
	cos: Math.cos,
	abs: Math.abs,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: Math.atan2,
	cbrt: Math.cbrt,
	ceil: Math.ceil,
	exp: Math.exp,
	floor: Math.floor,
	hypot: Math.hypot,
	log: Math.log,
	log10: Math.log10,
	log2: Math.log2,
	max: Math.max,
	min: Math.min,
	pow: Math.pow,
	random: Math.random,
	round: Math.round,
	sign: Math.sign,
	sqrt: Math.sqrt,
	tan: Math.tan,
	trunc: Math.trunc
};

const consts: any = {
	PI: Math.PI,
	E: Math.E,
	SQRT2: Math.SQRT2
};

let expr: string[];

const errorExp = (exp: string, got: string) => { throw `Era esperado um '${exp}', mas foi encontrado um '${got}'!` };

function nextToken(): string {
	let r = expr.shift();
	if (isUndefined(r)) return '';
	return r;
}

function currentToken(): string {
	return expr[0];
}

function parseFactor(): number {
	if (currentToken() === ')') errorExp("NUMBER", ')');
	let t = nextToken();

	if (t === '-') {
		return -parsePot();
	} else if (t === '~') {
		return ~parsePot();
	}

	if (t === '(') { // Parênteses
		let r = parse();
		let oo: string;
		if ((oo = nextToken()) !== ')') errorExp(')', oo);
		return r;
	} else { // Número, constante ou função
		let a = rules[rules.length - 1].re.exec(t);

		if (a === null) { // Número
			if (t.startsWith("0x")) return parseInt(t.slice(2), 16);
			return Number(t);
		} else { // Constante ou função
			if (Object.keys(functions).includes(t)) { // função
				let args: number[] = [];

				do {
					nextToken();

					let b = parse();
					if (isNaN(b)) break;

					args.push(b);
				} while (currentToken() === ',');

				nextToken();
				return <number>functions[t](...args);
			} else { // constante
				if (!Object.keys(consts).includes(t)) {
					throw `Função ou constante ${t} inexistente.`;
				}

				return <number>consts[t];
			}
		}
	}
}

// **
function parsePot(): number {
	let result = parseFactor();

	while (currentToken() === "**") {
		nextToken();
		let right = parseFactor();

		result = result ** right;
	}

	return result;
}

// * e /
function parseMult(): number {
	let result = parsePot();

	while (currentToken() === '*' || currentToken() === '/' || currentToken() === '%') {
		let tok = nextToken();
		if (tok === '*') {
			result *= parsePot();
		} else if (tok === '/') {
			result /= parsePot();
		} else {
			result %= parsePot();
		}
	}

	return result;
}

// + e -
function parseSum(): number {
	let result = parseMult();

	while (currentToken() === '+' || currentToken() === '-') {
		if (currentToken() === '+') {
			nextToken();
			result += parseMult();
		} else {
			nextToken();
			result -= parseMult();
		}
	}

	return result;
}

function parseShift(): number {
	let result = parseSum();

	while (currentToken() === '<<' || currentToken() === '>>') {
		if (currentToken() === '<<') {
			nextToken();
			result = result << parseSum();
		} else {
			nextToken();
			result = result >> parseSum();
		}
	}

	return result;
}

function parseAnd(): number {
	let result = parseShift();

	while (currentToken() === '&') {
		nextToken();
		result = result & parseShift();
	}

	return result;
}

function parseXor(): number {
	let result = parseAnd();

	while (currentToken() === '^') {
		nextToken();
		result = result ^ parseAnd();
	}

	return result;
}

function parse(): number {
	let result = parseXor();

	while (currentToken() === '|') {
		nextToken();
		result = result | parseXor();
	}

	return result;
}

export default <Command>{
	async run(msg: Message, _: Arguments, args: string[]) {
		if (args.length < 2) {
			msg.channel.send(MsgTemplates.error(msg.author, this.aliases[0]))
				.catch(discordErrorHandler);
			return;
		}

		let source = args.slice(1, args.length).join(' ');

		try {
			// result = tokenize(source);
			expr = tokenize(source);
			let result = parse();

			msg.channel.send(`${msg.author} O resultado é: \`${result}\``)
				.catch(discordErrorHandler);
		} catch (e) {
			msg.channel.send(`${msg.author} ${e}`)
				.catch(discordErrorHandler);
		}
	},
	syntaxes: ["expr"],
	permissions: Permission.NONE,
	aliases: ["calc"],
	description: "Sua calculadora do discord!",
	help: "Esta calculadora possui as seguintes operações: `+`, `-`, `*`, `/` e `**` (potência). Também é possível usar constantes e funções matemáticas nela, como por exemplo `sin(x)`, `random()` e `atan2(0,-1)`. Se quiser conferir quais funções e constantes eu possuo ou até mesmo ver como isso funciona, você pode entrar no meu repositório usando o comando `" + Server.prefix + "github`!",
	examples: [`15 + 15 * 10 / 20 ^ 2 - 7`]
};