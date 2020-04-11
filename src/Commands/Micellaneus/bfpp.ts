import { Command, Arguments, Server, CommonMessages, Permission } from "../../definitions";
import { Message, TextChannel } from "discord.js";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 2) {
			msg.channel.send(CommonMessages.syntaxError);
			return;
		}

		const code = args.slice(1).join(' ');
		const result = interpret(code);

		if (result.success)
			msg.channel.send(`${msg.author} Output: \`\`\` ${result.output}\`\`\`\nMemory: \`\`\`${result.memory}\`\`\``);
		else
			msg.channel.send(`${msg.author} ${result.error}\nMemory: \`\`\`${result.memory}\`\`\``);


		type Result = { success: true, output: string, memory: string } | { success: false, error: string, memory: string };
		function interpret(c: string): Result {
			const maxIterations = 10000000;
			const s = 255;

			let output: string[] = [];
			let memory = new Array<number>(256);
			let ptr = 0;
			let curr = 0;
			let funcs = new Array<number | undefined>(256);
			let callstack = new Array<number>();
			let error: string | null = null;

			//let infLoop: number = 0;

			for (let i = 0; i < memory.length; i++) memory[i] = 0;

			let it = 0;
			while (curr < c.length) {
				if (it > maxIterations) {
					error = "Erro: Limite de iterações ultrapassado.";
					break;
				}
				ptr = ptr & s;
				if (ptr < 0) ptr = s;

				const t = c[curr];

				switch (t) {
					case '>': ptr++; break;
					case '<': ptr--; break;
					case '+': memory[ptr] = (memory[ptr] + 1) & s; break;
					case '-': if (--memory[ptr] < 0) memory[ptr] = s; break;
					case '.': output.push(String.fromCharCode(memory[ptr])); break; // .fromCharCode
					case '[':
						if (memory[ptr] === 0) {
							let counter = 0;
							while (c[++curr] !== ']' || counter > 0) {
								if (c[curr] === '[') counter++;
								else if (c[curr] === ']') counter--;
								if (curr > c.length) { error = "Erro de Sintaxe: ']' faltando!"; break; }
							}
							curr++;
						}
						break;
					case ']':
						if (memory[ptr] !== 0) {
							let counter = 0;
							while (c[--curr] !== '[' || counter > 0) {
								if (c[curr] === ']') counter++;
								else if (c[curr] === '[') counter--;
								if (curr < 0) { error = "Erro de Sintaxe: '[' faltando!"; break; }
							}
						}
						break;
					case '{': {
						if (memory[ptr] === 0) {
							error = "Erro: Uma subrotina não pode ter o ID 0 (nulo)!";
							break;
						}
						funcs[memory[ptr]] = curr;

						let counter = 0;
						while (c[++curr] !== '}' || counter > 0) {
							if (c[curr] === '{') counter++;
							else if (c[curr] === '}') counter--;
							if (curr > c.length) { error = "Erro de Sintaxe: '}' faltando!"; break; }
						}
						curr++;
					} break;
					case '}':
						if (callstack.length === 0) {
							error = "Erro de Sintaxe: '}' sem par!";
							break;
						}

						curr = <number>callstack.pop();
						break;
					case '#':
						if (memory[ptr] !== 0) {
							callstack.push(curr);
							let f = funcs[memory[ptr]];
							if (f === undefined) {
								error = `Erro: Função indefinida '${memory[ptr]}'!`;
								break;
							}

							curr = f;
						}
						break;
				}

				if (error !== null) {
					return { success: false, error: error, memory: memory.join(' ') };
				}
				curr++;
				it++;
			}

			return { success: true, output: output.join(''), memory: memory.join(' ') };
		}
	},
	permissions: Permission.Shitpost,
	aliases: ["brainfuck++", "bfpp", "bf++"],
	shortHelp: "Um interpretador de BF",
	longHelp: "Um interpretador de Brainfuck com subrotinas (Limite de iterações: 10000000)",
	example: `${Server.prefix}bfpp +++[>+++++<-]>[>+++++<-]>+++.+.-.---------.`
};