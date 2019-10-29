import { shitpostChannel, sintaxErrorMessage } from '../constants';
import { Message } from 'discord.js';

let dankiImageCurrent: number = 0;
const luxuriaID = "338717274032701460";
export default class Micellaneous {
    /* ULOOOON */
    ulon(msg) {
        if (msg.channel.name !== shitpostChannel) return;
        const qnt = Math.floor(Math.random() * 200 + 2);
        msg.channel.send("UL" + "O".repeat(qnt) + "N")
            .catch(console.error);
    }

    /* EMOJI */
    emoji(msg, args) {
        if (args.length < 2) {
            msg.channel.send(sintaxErrorMessage);
            return;
        }

        const e = msg.guild.emojis.find(a => a.name === args[1]);
        if (e === null || e === undefined) {
            msg.channel.send(`O emoji \`${args[1]}\` é inválido.`);
            return;
        }

        let name = msg.member.nickname === null ? msg.author.username : msg.member.nickname;
        if (msg.author.id === luxuriaID) name = "raquel";
        const image = msg.author.avatarURL;

        msg.channel.createWebhook(name, image)
            .then(w => {
                w.send(`${e}`).then(() => w.delete())
            }).catch(a => msg.channel.send(a));

        msg.delete();
    }

    danki(msg: Message) {
        const images: string[] = [
            "https://cdn.discordapp.com/attachments/553933292542361601/633732233156362270/Danki_Boude.png",
            "https://cdn.discordapp.com/attachments/553933292542361601/633732285547544605/gamedev.png",
            "https://tenor.com/view/danki-danki-code-danki-cry-curso-danki-gif-15268437",
            "https://tenor.com/view/danki-dankicode-gif-15270906"
        ];
        dankiImageCurrent = (dankiImageCurrent + 1) % images.length;

        msg.channel.send(`${msg.author} ${images[dankiImageCurrent]}`);
    }

    brainfuck(msg: Message, args: string[]) {
        if (args.length < 2) {
            msg.channel.send(`${msg.author} Informe o código que deverá ser interpretado.`);
            return;
        }

        const code: string = args[1];
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
    }
}


