/**
 * Este parser é um recursive-descent parser
 */

import { Command, Arguments, Server, CommonMessages } from "../../definitions";
import { Message } from "discord.js";
import { isUndefined, isNull } from "util";

const rules = [
	{ name: "number_literal", re: /^[0-9]+(\.[0-9]+)?/ },
	{ name: "number_literal_hex", re: /^0x[0-9a-fA-F]+/ },
	{ name: "plus", re: /^\+/ },
	{ name: "minus", re: /^-/ },
	{ name: "div", re: /^\// },
	{ name: "pot", re: /^\*\*/ },
	{ name: "mult", re: /^\*/ },
	{ name: "open_p", re: /^\(/ },
	{ name: "close_p", re: /^\)/ },
	{ name: "close_p", re: /^,/ },
	// { name: "and", re: /^&/ },
	// { name: "or", re: /^\|/ },
	// { name: "xor", re: /^\^/ },
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

function nextToken(): string {
	let r = expr.shift();
	if (isUndefined(r)) return '';
	return r;
}

function currentToken(): string {
	return expr[0];
}

function parseFactor(): number {
	if (currentToken() === ')') return NaN;
	let t = nextToken();

	let mult = 1;
	if (t === '-') {
		mult = -1;
		t = nextToken();
	}

	if (t === '(') { // Parênteses
		return parse();
	} else { // Número, constante ou função
		let a = rules[rules.length - 1].re.exec(t);

		if (a === null) { // Número
			return Number(t) * mult;
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
				return <number>functions[t](...args) * mult;
			} else { // constante
				if (!Object.keys(consts).includes(t)) {
					throw `Função ou constante ${t} inexistente.`;
				}

				return <number>consts[t] * mult;
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

	while (currentToken() === '*' || currentToken() === '/') {
		if (currentToken() === '*') {
			nextToken();
			result *= parsePot();
		} else {
			nextToken();
			result /= parsePot();
		}
	}

	return result;
}

// + e -
function parse(): number {
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

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 2) {
			msg.channel.send(`${msg.author} ${CommonMessages.syntaxError}`);
			return;
		}

		let source = args.slice(1, args.length).join(' ');

		try {
			// result = tokenize(source);
			expr = tokenize(source);
			let result = parse();

			msg.channel.send(`${msg.author} O resultado é: \`${result}\``);
		} catch (e) {
			msg.channel.send(`${msg.author} ${e}`);
		}

	},
	staff: false,
	aliases: ["calc"],
	shortHelp: "Sua calculadora do discord!",
	longHelp: "Esta calculadora possui as seguintes operações: `+`, `-`, `*`, `/` e `**` (potência). Também é possível usar constantes e funções matemáticas nela, como por exemplo `sin(x)`, `random()` e `atan2(0,-1)`. Se quiser conferir quais funções e constantes eu possuo ou até mesmo ver como isso funciona, você pode entrar no meu repositório usando o comando `" + Server.prefix + "github`!",
	example: `${Server.prefix}calc expr\n${Server.prefix}calc 15 + 15 * 10 / 20 ^ 2 - 7`
};