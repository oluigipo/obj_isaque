import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

enum TokenType { LPAREN, RPAREN, NUMBER, ID, STRING, QUOTE, LBRACK, RBRACK, LCURLY, RCURLY, MENTION, EOF }

class Token {
	constructor(public kind: TokenType, public num_val: number | null, public str_val: string | null) { }
	static LPAREN() { return new Token(TokenType.LPAREN, null, null); }
	static RPAREN() { return new Token(TokenType.RPAREN, null, null); }
	static LBRACK() { return new Token(TokenType.LBRACK, null, null); }
	static RBRACK() { return new Token(TokenType.RBRACK, null, null); }
	static LCURLY() { return new Token(TokenType.LCURLY, null, null); }
	static RCURLY() { return new Token(TokenType.RCURLY, null, null); }
	static QUOTE() { return new Token(TokenType.QUOTE, null, null); }
	static EOF() { return new Token(TokenType.EOF, null, null); }
	static NUMBER(num_val: number) { return new Token(TokenType.NUMBER, num_val, null); }
	static SYMBOL(str_val: string) { return new Token(TokenType.ID, null, str_val); }
	static STRING(str_val: string) { return new Token(TokenType.STRING, null, str_val); }
	static MENTION(str_val: string) { return new Token(TokenType.MENTION, null, str_val); }
}

enum ExprType { NUM, STR, SYM, LIST, PAIR, FUNC, MENTION }

class Expr {
	args: string[] | null = null;
	access: CallFrame | null = null;

	constructor(public kind: ExprType, public num_val: number | null, public str_val: string | null, public list_val: Expr[] | null) { }
	static NUM(num_val: number) { return new Expr(ExprType.NUM, num_val, null, null); }
	static SYM(str_val: string) { return new Expr(ExprType.SYM, null, str_val, null); }
	static STR(str_val: string) { return new Expr(ExprType.STR, null, str_val, null); }
	static LIST(list_val: Expr[]) { return new Expr(ExprType.LIST, null, null, list_val); }
	static PAIR(list_val: Expr[]) { return new Expr(ExprType.PAIR, null, null, list_val); }
	static FUNC(args: string[], list_val: Expr[], access: CallFrame | null) {
		let p = new Expr(ExprType.FUNC, null, null, list_val);
		p.args = args;
		p.access = access;
		return p;
	}

	isNil(): boolean {
		return this.kind == ExprType.LIST && this.list_val?.length == 0;
	}

	get as_num(): number {
		if (this.num_val == null) throw `TypeError: Expression \`${this.toDebug()}\` is not a number`;
		return this.num_val;
	}

	get as_str(): string {
		if (this.kind != ExprType.STR || this.str_val == null) throw `TypeError: Expression \`${this.toDebug()}\` is not a string`;
		return this.str_val;
	}

	get as_sym(): string {
		if (this.kind != ExprType.SYM || this.str_val == null) throw `TypeError: Expression \`${this.toDebug()}\` is not a symbol`;
		return this.str_val;
	}

	get as_list(): Expr[] {
		if (this.kind != ExprType.LIST || this.list_val == null) throw `TypeError: Expression \`${this.toDebug()}\` is not a list`;
		return this.list_val;
	}

	get head(): Expr {
		if (!(this.kind == ExprType.LIST || this.kind == ExprType.PAIR)) throw `TypeError: Expression \`${this.toDebug()}\` is not a list`;
		return this.list_val?.[0] ?? LispVM.nil;
	}

	get tail(): Expr {
		if (this.kind == ExprType.LIST)
			return Expr.LIST(this.list_val?.slice(1) ?? []);
		if (this.kind == ExprType.PAIR && this.list_val)
			return this.list_val[1];
		throw `TypeError: Expression \`${this.toDebug()}\` is not a list`;
	}

	equals(e: Expr): boolean {
		if (this.kind != e.kind) return false;
		switch (this.kind) {
			case ExprType.NUM:
				return this.num_val == e.num_val;
			case ExprType.STR:
			case ExprType.SYM:
				return this.str_val == e.str_val;
			case ExprType.LIST:
				if (this.list_val == null) throw "Unreachable";
				if (e.list_val == null) throw "Unreachable";
				for (var i = 0; i < (this.list_val?.length ?? 0); i++) {
					if (!this.list_val[i].equals(e.list_val[i])) return false;
				}
				return true;
			case ExprType.PAIR:
				if (this.list_val == null) throw "Unreachable";
				if (e.list_val == null) throw "Unreachable";
				return this.list_val[0].equals(this.list_val[1]);
			case ExprType.FUNC:
				return false;
			case ExprType.MENTION:
				return this.str_val == e.str_val;
		}
	}

	toString(): string {
		switch (this.kind) {
			case ExprType.NUM:
				return `${this.num_val}`;
			case ExprType.STR:
				return `${this.str_val}`;
			case ExprType.SYM:
				return this.str_val ?? "Unknown Symbol";
			case ExprType.LIST:
				return `(${this.list_val?.join(" ")})`;
			case ExprType.PAIR:
				if (this.list_val == null) return `null.null`;
				return `(${this.list_val[0]} . ${this.list_val[1]})`;
			case ExprType.FUNC:
				if (this.list_val == null) return `null -> null`;
				return `${this.args} -> ${this.list_val[0]}`;
			case ExprType.MENTION:
				// if (this.list_val == null) return `null.null`;
				return `${this.num_val}`;
		}
	}

	toDebug(): string {
		switch (this.kind) {
			case ExprType.NUM:
				return `${this.num_val}`;
			case ExprType.STR:
				return `"${this.str_val}"`;
			case ExprType.SYM:
				return `'${this.str_val}`;
			case ExprType.LIST:
				if (this.list_val == null) return `'null`;
				return `\'(${this.list_val.map((a) => a.toDebug()).join(" ")})`;
			case ExprType.PAIR:
				if (this.list_val == null) return `'null`;
				return `\'(${this.list_val[0].toDebug()} . ${this.list_val[1].toDebug()})`;
			case ExprType.FUNC:
				if (this.list_val == null) return `'null`;
				return `${this.args} -> ${this.list_val[0].toDebug()}`;
			case ExprType.MENTION:
				// if (this.list_val == null) return `null.null`;
				return `${this.num_val}`;
		}
	}
}

const NUMBER_RE = /^[0-9]+(\.[0-9]+)?/;
const STRING_RE = /^"[^"]*"/;
const SYMBOL_RE = /^[a-zA-Z_@#\$.:?+\-\*/\\%><&\^~|=!][a-zA-Z0-9_@#\$.:?+\-\*/\\%><&\^~|=!]*/;
const MENTION_RE = /^<@&?!?\d{18}\d*>/;


const native_scope: Map<string, (vm: LispVM, arr: Expr[]) => Expr> = new Map([
	["*", (vm: LispVM, arr: Expr[]) => Expr.NUM(arr.reduce((acc, n) => acc * n.as_num, 1))],
	["+", (vm: LispVM, arr: Expr[]) => Expr.NUM(arr.reduce((acc, n) => acc + n.as_num, 0))],
	["-", (vm: LispVM, arr: Expr[]) => arr.length >= 2 ? Expr.NUM(arr[0].as_num - arr[1].as_num) : Expr.NUM(-(arr[0]?.as_num ?? NaN))],
	["/", (vm: LispVM, arr: Expr[]) => Expr.NUM((arr[0]?.as_num ?? 0) / (arr[1]?.as_num ?? 0))],
	["//", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.trunc(arr[0]?.as_num / arr[1]?.as_num))],
	["%", (vm: LispVM, arr: Expr[]) => Expr.NUM(arr[0]?.as_num % arr[1]?.as_num)],
	["<", (vm: LispVM, arr: Expr[]) => (arr[0].as_num < arr[1].as_num) ? Expr.SYM('t') : LispVM.nil],
	[">", (vm: LispVM, arr: Expr[]) => (arr[0].as_num > arr[1].as_num) ? Expr.SYM('t') : LispVM.nil],
	["<=", (vm: LispVM, arr: Expr[]) => (arr[0].as_num <= arr[1].as_num) ? Expr.SYM('t') : LispVM.nil],
	[">=", (vm: LispVM, arr: Expr[]) => (arr[0].as_num >= arr[1].as_num) ? Expr.SYM('t') : LispVM.nil],
	["..", (vm: LispVM, arr: Expr[]) => Expr.STR(arr.map(e => e.toString()).join(''))],
	["str.len", (vm: LispVM, arr: Expr[]) => Expr.NUM(arr[0]?.as_str.length)],
	["str.slice", (vm: LispVM, arr: Expr[]) => Expr.STR(arr[0].as_str.substring(arr[1].as_num, arr[2].as_num))],
	["str.tail", (vm: LispVM, arr: Expr[]) => Expr.STR(arr[0].as_str.substring(arr[1].as_num))],
	["str.charat", (vm: LispVM, arr: Expr[]) => Expr.STR(arr[0].as_str[arr[1].as_num])],
	["str.explode", (vm: LispVM, arr: Expr[]) => Expr.LIST(arr[0].as_str.split('').map(s => Expr.STR(s)))],
	["==", (vm: LispVM, arr: Expr[]) => arr[0]?.equals(arr[1]) ? Expr.SYM("t") : Expr.LIST([])],
	["!=", (vm: LispVM, arr: Expr[]) => !(arr[0]?.equals(arr[1])) ? Expr.SYM("t") : Expr.LIST([])],
	["format-time", (vm: LispVM, arr: Expr[]) => Expr.STR(Common.formatTime(arr[0].as_num))],
	["randint", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.floor(Math.random() * arr[0].as_num))],
	["random", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.random())],
	["sin", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.sin(arr[0].as_num))],
	["cos", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.cos(arr[0].as_num))],
	["tan", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.tan(arr[0].as_num))],
	["asin", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.asin(arr[0].as_num))],
	["acos", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.acos(arr[0].as_num))],
	["atan", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.atan(arr[0].as_num))],
	["exp", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.exp(arr[0].as_num))],
	["log_e", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.log(arr[0].as_num))],
	["log_2", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.log2(arr[0].as_num))],
	["log_10", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.log10(arr[0].as_num))],
	["floor", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.floor(arr[0].as_num))],
	["ceil", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.ceil(arr[0].as_num))],
	["round", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.round(arr[0].as_num))],
	["trunc", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.trunc(arr[0].as_num))],
	["sqrt", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.sqrt(arr[0].as_num))],
	["sign", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.sign(arr[0].as_num))],
	["abs", (vm: LispVM, arr: Expr[]) => Expr.NUM(Math.abs(arr[0].as_num))],
	["min", (vm: LispVM, arr: Expr[]) => Expr.NUM(arr.map(n => n.as_num).reduce((a, b) => Math.min(a, b)))],
	["max", (vm: LispVM, arr: Expr[]) => Expr.NUM(arr.map(n => n.as_num).reduce((a, b) => Math.max(a, b)))],
	["first", (vm: LispVM, arr: Expr[]) => arr[0] ? arr[0].head : LispVM.nil],
	["rest", (vm: LispVM, arr: Expr[]) => arr[0] ? arr[0].tail : LispVM.nil],
	["second", (vm: LispVM, arr: Expr[]) => arr[0].as_list[1] ?? LispVM.nil],
	["third", (vm: LispVM, arr: Expr[]) => arr[0].as_list[2] ?? LispVM.nil],
	["fourth", (vm: LispVM, arr: Expr[]) => arr[0].as_list[3] ?? LispVM.nil],
	["fifth", (vm: LispVM, arr: Expr[]) => arr[0].as_list[4] ?? LispVM.nil],
	["sixth", (vm: LispVM, arr: Expr[]) => arr[0].as_list[5] ?? LispVM.nil],
	["seventh", (vm: LispVM, arr: Expr[]) => arr[0].as_list[6] ?? LispVM.nil],
	["eighth", (vm: LispVM, arr: Expr[]) => arr[0].as_list[7] ?? LispVM.nil],
	["nineth", (vm: LispVM, arr: Expr[]) => arr[0].as_list[8] ?? LispVM.nil],
	["enumerate", (vm: LispVM, arr: Expr[]) => arr[0] ? Expr.LIST(arr[0].as_list.map((e, i) => Expr.LIST([e, Expr.NUM(i)]))) : LispVM.nil],
	["map", (vm: LispVM, arr: Expr[]) => arr[0].kind == ExprType.FUNC ? Expr.LIST(arr.slice(1).map(arg => arg.as_list.map(e => vm.evaluate(Expr.LIST([arr[0], Expr.LIST([Expr.SYM("quote"), e])])))).flat(1)) : LispVM.nil],
	["filter", (vm: LispVM, arr: Expr[]) => arr[0].kind == ExprType.FUNC ? Expr.LIST(arr[1].as_list.filter(e => vm.evaluate(Expr.LIST([arr[0], Expr.LIST([Expr.SYM("quote"), e])])))) : LispVM.nil],
	["list", (vm: LispVM, arr: Expr[]) => Expr.LIST(arr)],
	["atom?", (vm: LispVM, arr: Expr[]) => arr[0].kind != ExprType.LIST ? Expr.SYM("t") : LispVM.nil],
	["nil?", (vm: LispVM, arr: Expr[]) => arr[0].isNil() ? Expr.SYM("t") : LispVM.nil],
	["str?", (vm: LispVM, arr: Expr[]) => arr[0].kind == ExprType.STR ? Expr.SYM("t") : LispVM.nil],
	["sym?", (vm: LispVM, arr: Expr[]) => arr[0].kind == ExprType.SYM ? Expr.SYM("t") : LispVM.nil],
	["num?", (vm: LispVM, arr: Expr[]) => arr[0].kind == ExprType.NUM ? Expr.SYM("t") : LispVM.nil],
	["func?", (vm: LispVM, arr: Expr[]) => arr[0].kind == ExprType.FUNC ? Expr.SYM("t") : LispVM.nil],
	["make-pair", (vm: LispVM, arr: Expr[]) => Expr.PAIR([arr[0], arr[1]])],
	["repeat", (vm: LispVM, arr: Expr[]) => Expr.LIST(new Array(arr[0].as_num).fill(arr[1] ?? LispVM.nil))],
	["time.now", (vm: LispVM, arr: Expr[]) => Expr.NUM(Date.now())],
	["time.list", (vm: LispVM, arr: Expr[]) => {
		const now = new Date(); return Expr.LIST([
			Expr.NUM(now.getUTCFullYear()),
			Expr.NUM(now.getUTCMonth()),
			Expr.NUM(now.getUTCDate()),
			Expr.NUM(now.getUTCHours()),
			Expr.NUM(now.getUTCMinutes()),
			Expr.NUM(now.getUTCSeconds()),
			Expr.NUM(now.getUTCMilliseconds())])
	}],
]);

class LispVM {

	static nil = Expr.LIST([]);
	static t = Expr.SYM('t');

	_expr: Expr;
	global_scope = new Map([["nil", LispVM.nil]]);
	stack: CallFrame[] = [];

	constructor(public source: string) {
		this._expr = this.parseExpr(this.nextToken());
	}

	eval(): Expr {
		return this.evaluate(this._expr);
	}

	nextToken(): Token {
		this.source = this.source.trimLeft();
		if (this.source == "") return Token.EOF();
		let match: RegExpExecArray | null;
		if (this.source[0] == "(") {
			this.source = this.source.substring(1);
			this.source = this.source.trimLeft();
			return Token.LPAREN();
		} else if (this.source[0] == ")") {
			this.source = this.source.substring(1);
			this.source = this.source.trimLeft();
			return Token.RPAREN();
		} else if (this.source[0] == "[") {
			this.source = this.source.substring(1);
			this.source = this.source.trimLeft();
			return Token.LBRACK();
		} else if (this.source[0] == "]") {
			this.source = this.source.substring(1);
			this.source = this.source.trimLeft();
			return Token.RBRACK();
		} else if (this.source[0] == "{") {
			this.source = this.source.substring(1);
			this.source = this.source.trimLeft();
			return Token.LCURLY();
		} else if (this.source[0] == "}") {
			this.source = this.source.substring(1);
			this.source = this.source.trimLeft();
			return Token.RCURLY();
		} else if (this.source[0] == "'") {
			this.source = this.source.substring(1);
			this.source = this.source.trimLeft();
			return Token.QUOTE();
		} else if ((match = NUMBER_RE.exec(this.source)) != null) {
			const n = match[0];
			this.source = this.source.substring(n.length);
			this.source = this.source.trimLeft();
			return Token.NUMBER(parseFloat(n));
		} else if ((match = STRING_RE.exec(this.source)) != null) {
			const n = match[0];
			this.source = this.source.substring(n.length);
			this.source = this.source.trimLeft();
			return Token.STRING(n.slice(1, -1));
		} else if ((match = MENTION_RE.exec(this.source)) != null) {
			const n = match[0];
			this.source = this.source.substring(n.length);
			this.source = this.source.trimLeft();
			return Token.MENTION(n);
		} else if ((match = SYMBOL_RE.exec(this.source)) != null) {
			const n = match[0];
			this.source = this.source.substring(n.length);
			this.source = this.source.trimLeft();
			return Token.SYMBOL(n);
		} else {
			throw `ParseError: Invalid token in \`${this.source.substr(0, 30)}...\``
		}
	}

	parseExpr(look: Token): Expr {
		switch (look.kind) {
			case TokenType.LPAREN: {
				let list_val: Expr[] = [];
				let tok: Token;
				while ((tok = this.nextToken())?.kind != TokenType.RPAREN) {
					if (tok == null) throw "ParseError: Invalid Syntax";
					if (tok.kind == TokenType.EOF) throw "ParseError: Unexpected End of Input";
					list_val.push(this.parseExpr(tok));
				}
				return Expr.LIST(list_val);
			}
			case TokenType.LBRACK: {
				let list_val: Expr[] = [];
				let tok: Token;
				while ((tok = this.nextToken())?.kind != TokenType.RBRACK) {
					if (tok == null) throw "ParseError: Invalid Syntax";
					if (tok.kind == TokenType.EOF) throw "ParseError: Unexpected End of Input";
					list_val.push(this.parseExpr(tok));
				}
				return Expr.LIST([Expr.SYM("list")].concat(list_val));
			}
			case TokenType.LCURLY: {
				let list_val: Expr[] = [];
				let tok: Token;
				let params: Expr[] = [];
				while ((tok = this.nextToken())?.kind != TokenType.RCURLY) {
					if (tok == null) throw "ParseError: Invalid Syntax";
					if (tok.kind == TokenType.EOF) throw "ParseError: Unexpected End of Input";
					if (tok.kind == TokenType.ID) {
						if (tok.str_val == '->') {
							params = list_val;
							list_val = [];
							continue;
						}
					}
					list_val.push(this.parseExpr(tok));
				}
				list_val.unshift(Expr.LIST(params));
				return Expr.LIST([Expr.SYM("lambda")].concat(list_val));
			}
			case TokenType.QUOTE: {
				let val: Expr;
				let tok = this.nextToken();
				val = this.parseExpr(tok);
				return Expr.LIST([Expr.SYM("quote"), val]);
			}
			case TokenType.NUMBER:
				return Expr.NUM(look.num_val ?? 0);
			case TokenType.STRING:
				return Expr.STR(look.str_val ?? "");
			case TokenType.ID:
				return Expr.SYM(look.str_val ?? "");
			default:
				throw "ParseError: Invalid Syntax";
		}
	}

	getSymbol(sym: string): Expr | null {
		let reverse = this.stack.slice().reverse();
		for (let frame of reverse) {
			var e = frame.gets(sym);
			if (e != null) return e;
		}
		return this.global_scope.get(sym) ?? null;
	}

	evaluate(e: Expr): Expr {
		if (this.stack.length > 30) throw `EvalError: Stack overflow, stack reached limit of 30`;
		if (e.kind == ExprType.LIST && e.list_val?.[0]) {
			const list = e.list_val;
			if (list[0].kind == ExprType.SYM && list[0].str_val) {
				let l: Expr[];
				switch (list[0].str_val) {
					case "quote":
						if (list[1] == null) throw `EvalError: \`quote\` requires one argument`;
						return list[1];
					case "if":
						if (list.length < 4) throw "EvalError: \`if\` requires three arguments";
						return this.evaluate(list[1]).isNil() ? this.evaluate(list[3]) : this.evaluate(list[2]);
					case "cond":
						for (let cond of list.slice(1)) {
							let c = cond.as_list;
							if (c.length < 2) throw "EvalError: \`cond\` requires arguments as a list with two expressions"
							if (!this.evaluate(c[0]).isNil()) return this.evaluate(c[1]);
						}
						return LispVM.nil;
					case "and": {
						let e: Expr = Expr.SYM('t');
						for (let cond of list.slice(1)) {
							if ((e = this.evaluate(cond)).isNil()) return e;
						}
						return e;
					}
					case "or": {
						let e: Expr = LispVM.nil;
						for (let cond of list.slice(1)) {
							if (!((e = this.evaluate(cond)).isNil())) return e;
						}
						return e;
					}
					case "cons": {
						if (list.length < 3) throw "EvalError: \`cons\` requires two arguments";
						let left: Expr = this.evaluate(list[1]);
						let right: Expr = this.evaluate(list[2]);
						if (right.kind == ExprType.LIST && right.list_val)
							return Expr.LIST([left, ...right.list_val]);
						return Expr.PAIR([left, right]);
					}
					case "lambda":
						if (list.length < 3) throw "EvalError: \`lambda\` requires two arguments";
						let args = list[1].as_list;
						return Expr.FUNC(
							args.map((a) => {
								let s = a.as_sym;
								return s;
							}),
							[list[2]], this.stack.length == 0 ? null : this.stack[this.stack.length - 1]
						);
					case "apply": {
						if (list.length < 3) throw "EvalError: \`apply\` requires two arguments";
						let func = this.evaluate(list[1]);
						let args = this.evaluate(list[2]).as_list;
						if (func.kind != ExprType.FUNC || func.args == null || func.list_val == null) {
							let nat = native_scope.get(func.as_sym);
							if (nat != null)
								return nat(this, args);
							throw `TypeError: Expression \`${func.toDebug()}\` is not a function`;
						} else {
							let local_scope = new CallFrame(func.access, new Map());
							let argn = 0;
							for (const arg of func.args) {
								local_scope.add(arg, this.evaluate(args[argn]));
								argn++;
							}
							this.stack.push(local_scope);
							let result = this.evaluate(func.list_val[0]);
							this.stack.pop();
							return result;
						}
					}
					case "global":
						if (list.length < 3) throw "CallError: Not enough arguments";
						l = list[1].as_list;

						l.forEach((decl) => decl.kind == ExprType.LIST && decl.list_val ?
							this.global_scope.set(decl.list_val[0].as_sym, this.evaluate(decl.list_val[1]))
							: null);
						return this.evaluate(list[2]);
					case "def":
						if (list.length < 4) throw "CallError: Not enough arguments";
						if (list[1].kind != ExprType.SYM || list[1].str_val == null) throw `TypeError: Expression \`${list[1].toDebug()}\` is not a symbol`;
						if (list[2].kind != ExprType.LIST || list[2].list_val == null) throw `TypeError: Expression \`${list[1].toDebug()}\` is not a list`;

						this.global_scope.set(
							list[1].str_val,
							Expr.FUNC(list[2].list_val.map((a) => a.as_sym), [list[3]],
								this.stack.length == 0 ? null : this.stack[this.stack.length - 1]
							));
						return LispVM.nil;

					case "block": {
						let e: Expr = LispVM.nil;
						for (var expr of list.slice(1)) {
							e = this.evaluate(expr);
						}
						return e;
					}
					default:
						let loc = this.getSymbol(list[0].str_val);
						if (loc != null) {
							if (loc.kind != ExprType.FUNC || loc.args == null || loc.list_val == null) throw `TypeError: Expression \`${loc}\` is not a function`;
							let local_scope = new CallFrame(loc.access, new Map());
							let argn = 1;
							for (const arg of loc.args) {
								if (list[argn] == undefined) throw `EvalError: Function requires ${loc.args.length} arguments`;
								local_scope.add(arg, this.evaluate(list[argn]));
								argn++;
							}
							this.stack.push(local_scope);
							let result = this.evaluate(loc.list_val[0]);
							this.stack.pop();
							return result;
						}

						let glob = this.global_scope.get(list[0].str_val);
						if (glob != null) {

							let local_scope = new CallFrame(glob.access, new Map());
							let argn = 1;
							if (glob.args == null || glob.list_val == null) throw "unreachable";
							for (const arg of glob.args) {
								if (list[argn] == undefined) throw `EvalError: Function requires ${glob.args.length} arguments`;
								local_scope.add(arg, this.evaluate(list[argn]));
								argn++;
							}
							this.stack.push(local_scope);
							let result = this.evaluate(glob.list_val[0]);
							this.stack.pop();
							return result;
						}
						let nat = native_scope.get(list[0].str_val);
						if (nat != null)
							return nat(this, list.slice(1).map((e) => this.evaluate(e)));
						throw `TypeError: Expression \`${list[0].toDebug()}\` is not a function`;
				}
			} else {
				let callee = this.evaluate(list[0]);
				if (callee.kind == ExprType.FUNC && callee.list_val && callee.args) {
					let local_scope = new CallFrame(callee.access, new Map());
					let argn = 1;
					for (const arg of callee.args) {
						local_scope.add(arg, this.evaluate(list[argn]));
						argn++;
					}
					this.stack.push(local_scope);
					let ret = this.evaluate(callee.list_val[0]);
					this.stack.pop();
					return ret;
				}
				throw `TypeError: Expression \`${callee.toDebug()}\` is not a function`;
			}
		} else if (e.kind == ExprType.SYM) {
			// let val = this.getSymbol(e.as_sym);
			// if (val) return val;
			// throw `BindError: Symbol \`${e.as_sym}\` not bound`
			return this.getSymbol(e.as_sym) ?? e;
		} else
			return e;
	}
}

class CallFrame {
	constructor(public access: CallFrame | null, public scope: Map<string, Expr>) { }

	gets(sym: string): Expr | null {
		return this.scope.get(sym) ?? this.access?.gets(sym) ?? null;
	}

	add(sym: string, e: Expr) {
		this.scope.set(sym, e);
	}

	toString() {
		return `${this.access ?? "{}"} <= ${this.scope}`;
	}
}

export default <Command>{
	async run(msg: Message<true>, _: Argument[], args: string[]) {
		try {
			let code = args.slice(1).join(' ');
			let vm = new LispVM(code);
			let e = vm.eval();
			let secure = e.toString().replace(/@everyone|@here/, (m) => m.substr(1));
			msg.channel.send(`Resultado: ${secure}`)
				.catch(Common.discordErrorHandler);
		} catch (error) {
			let secure = String(error).replace(/@everyone|@here/, (m) => m.substr(1));
			msg.channel.send(`Erro: ${secure}`)
				.catch(Common.discordErrorHandler);
		}
	},
	syntaxes: ["<code>"],
	permissions: Permission.SHITPOST,
	aliases: ['lisp'],
	description: "um interpretador de isaque-lisp, feito por <@310480160640073729>",
	help: `Documentação do isaque-lisp (feito por <@310480160640073729>):

isaque-lisp tem dois tipos de expressões listas e atoms.
Listas são feitas com a forma \`(a b c d)\` sendo a, b, c e d outras expressões.
Atoms são numeros e strings.

O primeiro item de uma lista é chamado como uma função com o resto da lista sendo seus argumentos.
Algumas funções são primitivas:

Operadores numericos:
	* + - / // % < > <= >=
	sin cos tan atan floor ceil 
	round trunc sign abs sqrt

Operações de string:
	.. 
	str.len
	str.slice str.tail
	str.charat str.explode

Operadores de igualdade:
	== != atom? nil? sym? str? num?

Outros:
	first rest map filter repeat
`,
	examples: [`(block
	(def fib (n) (
		if (< n 2)
			n
			(+ (fib (- n 1)) (fib (- n 2)))))
	(fib 10))`]
};
