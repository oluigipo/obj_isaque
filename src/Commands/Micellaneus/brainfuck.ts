import { Command, Arguments, Server, CommonMessages, Permission } from "../../definitions";
import { Message, TextChannel } from "discord.js";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 2) {
			msg.channel.send(CommonMessages.syntaxError);
			return;
		}

		const code: string = args.slice(1).join(' ');
		const result: string[] = interpret(code);

		msg.channel.send(`${msg.author} Output: \`\`\` ${result[0]}\`\`\`\nMemory: \`\`\`${result[1]}\`\`\``);

		function interpret(c: string): string[] {
			const maxIterations = 10000000;
			const s = 255;

			let output: string[] = [];
			let memory: number[] = new Array<number>(256);
			let ptr: number = 0;
			let curr: number = 0;

			//let infLoop: number = 0;

			for (let i = 0; i < memory.length; i++) memory[i] = 0;

			let it = 0;
			while (curr < c.length) {
				if (it > maxIterations) {
					output.push(" ERROR");
					break;
				}
				let toBreak: boolean = false;
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
							let counter: number = 0;
							while (c[++curr] !== ']' || counter > 0) {
								if (c[curr] === '[') counter++;
								else if (c[curr] === ']') counter--;
								if (curr > c.length) { toBreak = true; break; }
							}
							curr++;
						}
						break;
					case ']':
						if (memory[ptr] !== 0) {
							let counter: number = 0;
							while (c[--curr] !== '[' || counter > 0) {
								if (c[curr] === ']') counter++;
								else if (c[curr] === '[') counter--;
								if (curr < 0) { toBreak = true; break; }
							}
						}
						break;
				}

				if (toBreak) {
					output.push(" ERROR!");
					break;
				}
				curr++;
				it++;
			}

			const result: string[] = [output.join(''), memory.join(' ')];
			return result;
		}
	},
	permissions: Permission.Shitpost,
	aliases: ["brainfuck", "bf"],
	shortHelp: "Um interpretador de BF",
	longHelp: "Um interpretador de Brainfuck (Limite de iterações: 10000000)",
	example: `${Server.prefix}brainfuck +++[>+++++<-]>[>+++++<-]>+++.+.-.---------.`
};