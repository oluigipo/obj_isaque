import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

interface ExprResult {
	result: string;
	errors: string[];
}

export default <Command>{
	async run(msg: Message, _: Argument[], args: string[]) {
		if (args.length < 2) {
			msg.channel.send(`${msg.author} diz a conta aí, pô`).catch(Common.discordErrorHandler);
			return;
		}

		let source = args.slice(1, args.length).join(' ');

		try {
			let result = expr(source);
			let text = `${msg.author} O resultado é: \`${result.result}\``;

			if (result.errors.length > 0) {
				text += "\nAlguns erros ocorreram:";
				for (const err of result.errors)
					text += `\n${err}`;
			}

			msg.channel.send(text).catch(Common.discordErrorHandler);
		} catch (e) {
			msg.channel.send(`${msg.author} deu erro aqui, desculpa`).catch(Common.discordErrorHandler);
			Common.error(e);
		}
	},
	syntaxes: ["expr"],
	permissions: Permission.NONE,
	aliases: ["calc"],
	description: "Sua calculadora do discord!",
	help: "NOTA: Essa calculadora agora é um interpretador do [expr](https://github.com/oluigipo/expr). A seguir tem a descrição antiga que ainda funciona.\nEsta calculadora possui as seguintes operações: `+`, `-`, `*`, `/` e `**` (potência). Também é possível usar constantes e funções matemáticas nela, como por exemplo `sin(x)`, `random()` e `atan2(0,-1)`. Se quiser conferir quais funções e constantes eu possuo ou até mesmo ver como isso funciona, você pode entrar no meu repositório usando o comando `" + Common.SERVER.prefix + "github`!",
	examples: [`15 + 15 * 10 / 20 ^ 2 - 7`, `(1280, 720) / 4`]
};

// NOTE(ljre): This is https://github.com/oluigipo/expr
// TODO(ljre): Add type annotations.
function expr(e: string): ExprResult {
	let errors: string[] = [];
	
	function identchar(ch: string) {
		return ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch == '_';
	}
	
	function tuple(items: any) {
		return { tuple: items };
	}
	
	function kind(node: any): string | undefined {
		if (node === undefined)
			return undefined;
		if (typeof node == "number")
			return "number";
		if (typeof node == "string")
			return identchar(node[0]) ? "ident" : "op";
		if (typeof node == "function")
			return "builtin-function";
		if (Array.isArray(node))
			return "array";
		if (node.tuple)
			return "tuple";
		if (node.op && node.left && node.middle && node.right)
			return "ternary";
		if (node.op && node.left && node.right)
			return "binary";
		if (node.op && node.expr)
			return "unary";
		if (node.args && node.ret)
			return "function";
		return undefined;
	}
	
	function tokenize(e: string) {
		let result: (string | number)[] = [];
		let head = 0;
		
		function numchar(ch: string) {
			return ch >= '0' && ch <= '9' || ch == '.';
		}
		
		while (head < e.length) {
			while (e[head] == ' ' || e[head] == '`' || e[head] == '\t' || e[head] == '\n' || e[head] == '\r')
				++head;
			
			if (head >= e.length)
				break;
			
			if (identchar(e[head])) {
				let begin = head++;
				
				while (identchar(e[head]) || numchar(e[head]))
					++head;
				
				result.push(e.slice(begin, head));
				continue;
			}
			
			if (numchar(e[head])) {
				let begin = head++;
				
				while (numchar(e[head]) || e[head] == '_')
					++head;
				
				result.push(Number(e.slice(begin, head).replace('_', "")));
				continue;
			}
			
			let begin = head;
			
			// for double-char operators, increment head
			switch (e[head]) {
				case '=':
					if (['=', '>'].includes(e[head+1]))
						++head;
					break;
				
				case '<':
				case '>':
					if (e[head+1] == e[head]) {
						++head;
						break;
					}
				
				case '!':
					if (e[head+1] == '=')
						++head;
					break;
				
				case '|':
					if (['>', '|'].includes(e[head+1]))
						++head;
					break;
				
				case '&':
					if (e[head+1] == '&')
						++head;
					break;
			}
			
			result.push(e.slice(begin, ++head));
		}
		
		return result;
	}
	
	function parse(_tokens: (number | string)[]): any {
		let tokens = _tokens;
		let tok: string | number | undefined;
		
		function next(desired?: string) {
			if (desired != undefined && tok != desired) {
				errors.push(`expecting '${desired}', but got '${tok}'`);
			}
			tok = tokens.shift();
		}
		
		function trynext(desired: string) {
			if (tok == desired) {
				next();
				return true;
			}
			return false;
		}
		
		next();
		
		const precedence: { [key: string]: number | undefined } = {
			"?": 1,
			
			"||": 2,
			"&&": 3,
			
			"==": 4,
			"!=": 4,
			">=": 4,
			"<=": 4,
			"<": 4,
			">": 4,
			
			"|>": 5,
			
			"+": 6,
			"-": 6,
			"|": 6,
			
			"<<": 7,
			">>": 7,
			
			"*": 8,
			"/": 8,
			"%": 8,
			"^": 8,
			"&": 8,
		};
		
		const right2left = {
			
		};
		
		function factor(): any {
			// NOTE(ljre): Typescript can't figure out that 'next()' and 'trynext()' mutates 'tok'.

			let result = undefined;
			let prev = undefined;
			
			while (true) {
				switch (tok) {
					case '[': {
						let arr: number[] = [];
						
						next();
						while (trynext(','))
							arr.push(0);
						// @ts-ignore
						while (tok != ']') {
							arr.push(expr());
							
							// @ts-ignore
							if (tok != ']')
								next(',');
							while (trynext(','))
								arr.push(0);
						}
						next(']');
						
						if (kind(tok) == "number" && arr.length < tok) {
							let l = arr.length;
							for (let i = tok-1; i >= l; --i)
								arr[i] = 0;
							next();
						}
						
						result = arr;
					} break;
					
					case '(': {
						let arr = [];
						
						next();
						// @ts-ignore
						if (tok != ')' && tok != "=>") {
							while (trynext(','))
								arr.push(0);
							
							// @ts-ignore
							while (tok != ')' && tok != "=>") {
								arr.push(expr());
								// @ts-ignore
								if (tok != ')' && tok != "=>")
									next(',');
								
								while (trynext(','))
									arr.push(0);
							}
						}
						
						if (tok == '=>') {
							next();
							result = { args: arr, ret: expr() };
							next(')');
						} else {
							next(')');

							if (arr.length == 1)
								result = arr[0];
							else
								result = tuple(arr);
						}
					} break;
					
					default: {
						if (["number", "ident"].includes(kind(tok) ?? "")) {
							result = tok;
							next();
						} else {
							result = 0;
							errors.push("expected value");
						}
					} break;
				}
				
				if (prev)
					result = { op: "call", left: prev, right: result };
				
				if (["(", "["].includes(<any>tok) || ["ident", "number"].includes(<any>kind(tok))) {
					prev = result;
				} else {
					return result;
				}
			}
		}
		
		function expr(lvl = 0): any {
			let left = factor();
			let prec = precedence[tok ?? ""];
			
			while (prec && prec > lvl) {
				let op = tok;
				next();
				let right = factor();
				
				let lookahead = tok ?? "";

				// NOTE(ljre): Typescript says that, on 'precedence[lookahead] > prec', 'precedence[lookahead]' might be null...
				//             YES, I KNOW IT!!!!! THAT'S WHY THERE'S A FUCKING 'precedence[lookahead] &&'!!!

				while (precedence[lookahead] &&
					   // @ts-ignore
					   (precedence[lookahead] > prec ||
					   	// @ts-ignore
						(precedence[lookahead] == prec && right2left[lookahead]))) {
					next();
					
					if (lookahead == '?') {
						let if_true = expr();
						next(':');
						let if_false = expr();
						
						right = {
							op: '?',
							left: right,
							middle: if_true,
							right: if_false,
						};
					} else {
						// @ts-ignore
						let other = expr(precedence[lookahead] + 1);
						right = {
							op: lookahead,
							left: right,
							right: other,
						};
					}
					
					lookahead = tok ?? "";
				}
				
				left = { op, left, right };
				prec = precedence[tok ?? ""];
			}
			
			return left;
		}
		
		return expr();
	}
	
	function run(ast: any): any {
		let callstack = 0;
		let callstackLimit = 100;
		
		function makeBuiltin(orig: any): any {
			return function f(v: any): any {
				return kind(v[0]) == "array" ? v[0].map((item: any) => call(f, item)) : orig(...v);
			}
		}
		
		function kind2(value: any): string | undefined {
			let k = kind(value);
			if (k == "builtin-function")
				k = "function";
			
			return k;
		}
		
		function clean(array: any[]): any[] {
			array = [...array];
			
			for (let i = 0; i < array.length; ++i) {
				if (array[i] == undefined || array[i] == null) {
					array[i] = 0;
				}
			}
			
			return array;
		}
		
		function makeBuilder(required: any, exec: (args: any) => any, reqfn = kind2) {
			let recievedArgs: any = {};
			let argsNames = Object.keys(required);
			let neededArgs = argsNames.map(key => required[key]);
			
			return function builder(args: any): any {
				for (const arg of args) {
					let k = reqfn(arg);
					
					let ind = neededArgs.indexOf(k);
					if (ind == -1) {
						errors.push("argument of unneeded type");
					} else {
						neededArgs[ind] = "";
						recievedArgs[argsNames[ind]] = arg;
					}
				}
				
				if (neededArgs.reduce((a, v) => a + v, "") == "") {
					return exec(recievedArgs);
				} else {
					return builder;
				}
			}
		}
		
		let env: any = {
			reduce: (args: any) => {
				let startacc = 0;
				let fn: any = undefined;
				let array: any = undefined;
				
				function f(args: any) {
					for (const arg of args) {
						switch (kind(arg)) {
							case "number": startacc = arg; break;
							case "builtin-function":
							case "function": fn = arg; break;
							case "array": array = arg; break;
						}
					}
					
					if (array != undefined && fn != undefined)
						return array.reduce((acc: any, val: any, index: any) => call(fn, [acc, val, index]), startacc);
					else
						return f;
				}
				
				return f(args);
			},
			filter: makeBuilder({ arr: "array", fn: "function" },
								({arr, fn}) => arr.filter((value: any, index: any) => calla(fn, [value, index]))),
			map: makeBuilder({ arr: "array", fn: "function" },
							({arr, fn}) => arr.map((value: any, index: any) => calla(fn, [value, index]))),
			join: makeBuilder({ first: "array", second: "array" },
							 ({first, second}) => [...first, ...second]),
			find: makeBuilder({ arr: "array", n: "number" },
							  ({arr, n}) => arr.indexOf(n)),
			has: makeBuilder({ arr: "array", n: "number" },
							 ({arr, n}) => arr.includes(n) + 0),
			where: makeBuilder({ arr: "array", n: "number", fn: "function" },
							 ({arr, n, fn}) => arr.map((val: any, i: any) => val == n ? calla(fn, [val, i]) : val)),
			take: makeBuilder({ ind: "number", from: "array" },
							 ({ind, from}) => from.slice(0, ind)),
			drop: makeBuilder({ ind: "number", from: "array" },
							 ({ind, from}) => from.slice(ind)),
			group: makeBuilder({ inds: "array", vals: "array" },
							({inds, vals}) => clean(vals.reduce((a: any, val: any) => {
								let i = inds.shift();
								if (i >= 0) {
									a[i] !== undefined || (a[i] = []);
									a[i].push(val);
								}
								return a;
							}, []))),
			sin: makeBuiltin(Math.sin),
			cos: makeBuiltin(Math.cos),
			abs: makeBuiltin(Math.abs),
			acos: makeBuiltin(Math.acos),
			asin: makeBuiltin(Math.asin),
			atan: makeBuiltin(Math.atan),
			atan2: makeBuiltin(Math.atan2),
			cbrt: makeBuiltin(Math.cbrt),
			ceil: makeBuiltin(Math.ceil),
			exp: makeBuiltin(Math.exp),
			floor: makeBuiltin(Math.floor),
			hypot: makeBuiltin(Math.hypot),
			log: makeBuiltin(Math.log),
			log10: makeBuiltin(Math.log10),
			log2: makeBuiltin(Math.log2),
			max: makeBuiltin(Math.max),
			min: makeBuiltin(Math.min),
			pow: makeBuiltin(Math.pow),
			random: makeBuiltin(Math.random),
			round: makeBuiltin(Math.round),
			sign: makeBuiltin(Math.sign),
			sqrt: makeBuiltin(Math.sqrt),
			tan: makeBuiltin(Math.tan),
			trunc: makeBuiltin(Math.trunc),
			sqr: makeBuiltin((x: number) => x*x),
			PI: Math.PI,
			E: Math.E,
			SQRT2: Math.SQRT2,
		};
		
		function find(ident: string): any {
			let result;
			let e = env;
			
			do {
				result = e[ident];
			} while (result == undefined && (e = e[0]) != undefined);
			
			if (result == undefined) {
				errors.push(`unknown identifier '${ident}'`);
				result = 0;
			}
			
			return result;
		}
		
		function calla(fn: any, arr: any): any {
			return call(fn, tuple(arr));
		}
		
		function call(fn: any, args: any): any {
			if (callstack > callstackLimit) {
				errors.push(`stack overflow (limit: ${callstackLimit})`);
				return 0;
			}
			
			let result: any = 0;
			++callstack;
			let argsk = kind(args);
			
			switch (kind(fn)) {
				case "function":
					if (argsk == "tuple")
						args = args.tuple;
					else
						args = [args];
					
					let oldenv = env;
					if (fn.env != undefined) {
						env = fn.env;
					} else {
						env = { 0: env };
					}
					
					for (const arg of fn.args) {
						let val = args.shift();
						if (val == undefined)
							val = 0;
						
						if (arg != undefined && arg != 0)
							env[arg] = val;
					}
					result = interpret(fn.ret);
					env = oldenv;
					break;
				case "builtin-function":
					if (argsk == "tuple")
						args = args.tuple;
					else
						args = [args];
					
					result = fn(args);
					break;
				case "array":
					if (argsk == "array") {
						if (kind(args[0]) == "number") {
							result = fn[args[0]];
							
							if (result == undefined) {
								errors.push(`index '${args[0]}' out of bounds (length = ${fn.length})`);
								result = 0;
							}
						} else {
							errors.push("array index should be a number");
							result = 0;
						}
					} else if (argsk == "function" || argsk == "builtin-function") {
						result = call(args, fn);
					} else if (argsk == "number") {
						result = [];
						let i = 0;
						for (; i < fn.length; ++i)
							result[i] = fn[i];
						for (; i < args; ++i)
							result[i] = 0;
					} else {
						errors.push("invalid use of array");
						result = 0;
					}
					break;
				default:
					errors.push("left-side of function call is not a function");
					break;
			}
			--callstack;
			
			return result;
		}
		
		function unary(op: string, expr: any): any {
			let exprk = kind(expr);
			if (exprk == "tuple") {
				expr = expr.tuple;
				exprk = "array";
			}
			
			switch (op) {
				case '+': return  expr;
				case '-': return -expr;
				case '~': return ~expr;
				case '!': return !expr;
				default: return expr;
			}
		}
		
		function binary(op: string, left: any, right: any): any {
			let leftk = kind(left);
			let rightk = kind(right);
			
			if (["+", "-", "/", "*", "%", "<<", ">>", "&", "|", "^"].includes(op)) {
				if (leftk == "tuple") {
					left = left.tuple;
					leftk = "array";
				}
				
				if (rightk == "tuple") {
					right = right.tuple;
					rightk = "array";
				}
				
				if (leftk == "array" && rightk == "number")
					return left.map((v: any) => binary(op, v, right));
				if (leftk == "number" && rightk == "array")
					return right.map((v: any) => binary(op, left, v));
				if (leftk == "array" && rightk == "array" && left.length == right.length)
					return left.map((v: any, i: any) => binary(op, v, right[i]));
			}
			
			switch (op) {
				case "call": return call(left, right);
				case "+": return left + right;
				case "-": return left - right;
				case "*": return left * right;
				case "/": return left / right;
				case "%": return left % right;
				case ">>": return left >> right;
				case "<<": return left << right;
				case "|>": return call(right, [left]);
				case "==": return left == right;
				case "!=": return left != right;
				case ">=": return left >= right;
				case "<=": return left <= right;
				case ">": return left > right;
				case "<": return left < right;
				case "&": return left & right;
				case "|": return left | right;
				case "^": return left ^ right;
				case "&&": return left != 0 && right != 0;
				case "||": return left != 0 || right != 0;
			}
			
			errors.push(`unknown binary operation ${op}`);
			return 0;
		}
		
		function interpret(node: any): any {
			switch (kind(node)) {
				case "number": return node;
				case "ident": return find(node);
				case "binary": return binary(node.op, interpret(node.left), interpret(node.right));
				case "ternary": return interpret(node.left) ? interpret(node.middle) : interpret(node.right);
				case "unary": return unary(node.op, interpret(node.expr));
				case "tuple": return tuple(node.tuple.map((value: any) => interpret(value)));
				case "array": return node.map((value: any) => interpret(value));
				case "function":
					node.env = env;
				default: return node;
			}
		}
		
		//return ast;
		return interpret(ast);
	}
	
	function stringify(node: any): any {
		switch (kind(node)) {
			case "number": return String(node);
			case "ident": return `identifier: ${node}`;
			case "tuple": node = node.tuple;
			case "array": return `[${node.map(stringify).join(', ')}]`;
			case "function": return `function: (TODO)\n`;
			case "builtin-function": return `builtin-function: ${node.name}`;
		}
		
		return "what?";
	}
	
	let tokens = tokenize(e);
	let ast = parse(tokens);
	let result = run(ast);

	return { result: stringify(result), errors };
}