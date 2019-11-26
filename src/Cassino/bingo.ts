import { Message, MessageReaction, User, Collection } from "discord.js";
import { Emojis, formatDate } from "../definitions";
import { Bank } from ".";

interface Cartela {
    owner: string;
    cartela: number[];
}

export let bingoCurrent: Bingo | -1 = -1;

export class Bingo {
    public size: number;
    public timeToRun: number;
    public msg: Message;
    public prizeval: number;
    public cartelas: Cartela[] = [];
    public sorteados: boolean[] = [];
    public checkWin: string = "";
    public max: number = 60;
    public sorteadosN: number[] = [];
    constructor(msg: Message, timeToRun: number, size: number, prize: number) {
        this.size = size;
        this.timeToRun = timeToRun * 1000; // TRansformar em MS, coisa que tu não fez.
        this.msg = msg;
        this.prizeval = prize;
        bingoRun(this);
    }
    /**
         * @returns {boolean}
         */
    check(): boolean {
        const index = this.cartelas.findIndex(c => c.owner === this.checkWin);
        let confirm = this.size;

        for (let i = 0; i < this.cartelas[index].cartela.length; i++) {
            let confirm2 = this.size;
            for (let j = 0; j < this.cartelas[index].cartela.length; j++) {
                if (j === 0) confirm2 = this.size;
                if (this.sorteados[this.cartelas[index].cartela[i + j * this.size]]) confirm2--;
                if (confirm2 === 0) return true;
            }
            if (i % this.size === 0) confirm = this.size;
            if (this.sorteados[this.cartelas[index].cartela[i]]) confirm--;
            if (confirm === 0) return true;
        }

        return false;
    }

    static setCurrent(b: Bingo) {
        bingoCurrent = b;
    }

    prize() {
        return this.prizeval;
    }
}

function bingoRun(b: Bingo): void {
    let gamemsg: Message;
    let tickCount = 0;
    let winner = -1;
    let gameEnd = false;
    let text: string;
    const numberPerTick = 5;
    const tickRate = 100;
    initialize();
    // Gera as paradinhas do bingo (cartelas) e manda as msgs na dm dos users
    function initialize() {
        for (let i = 0; i < b.max; i++) {
            b.sorteados[i] = false;
        }

        const filter = (reaction: MessageReaction, user: User) => reaction.emoji.name === Emojis.yes && user.id !== b.msg.client.user.id && Bank.isRegistered(user.id);

        b.msg.channel.send(`${b.msg.author} O bingo iniciará em ${formatDate(b.timeToRun)}! Prêmio: \`${b.prizeval}\``)
            .then((message: Message | Message[]) => {
                if (message !== <Message>message) return;
                message.react(Emojis.yes);
                const collector = message.createReactionCollector(filter, { time: b.timeToRun });
                collector.on("end", (collection: Collection<string, MessageReaction>) => {
                    collection.forEach(reaction => {
                        reaction.users.forEach(user => {
                            if (user.id === b.msg.client.user.id) return;
                            if (Bank.isRegistered(user.id)) {
                                const car = generateCartela();
                                b.cartelas.push({ owner: user.id, cartela: car });

                                user.createDM()
                                    .then(dm => {
                                        dm.send(`${fortmatCartela(car)}`).then(() => { dm.delete(); });
                                    });
                            } else {
                                b.msg.channel.send(`${user} Você não está registrado.`);
                            }
                        });
                    });

                    start();
                });
            });
    }

    function fortmatCartela(cartela: number[]) {
        let text = "```";
        for (let i = 0; i < cartela.length; i++) {
            if (i % b.size === 0) text += "\n";
            text += `${cartela[i] + ' '.repeat(3 - String(cartela[i]).length)}`;
        }
        text += "\n```";
        return text;
    }

    function generateCartela() {
        let cartela: number[] = [];
        let generated: number[] = [];

        for (let i = 0; i < b.size * b.size; i++) {
            let gen: number;
            do {
                gen = Math.trunc(Math.random() * b.max + 1);
            } while (generated.some(a => a === gen));

            cartela.push(gen);
            generated.push(gen);
        }

        cartela = cartela.sort((a, b) => (Number)(a > b));
        return cartela;
    }

    function start() {
        const maxSize = String(b.cartelas.length).length;
        text = "Os participantes são:```";
        for (let i = 0; i < b.cartelas.length; i++) {
            const member = b.msg.guild.members.find(a => a.id === b.cartelas[i].owner);
            text += `${i + 1 + ' '.repeat(maxSize - String(i).length)}- ${member.user.tag}\n`;
        }
        text += "```";

        b.msg.channel.send(text).then(message => {
            gamemsg = <Message>message;
            setTimeout(tick, tickRate);
        });
    }

    function tick() {
        let generateNumber = (tickCount === 0);
        tickCount = (tickCount + 1) % numberPerTick;

        if (b.checkWin !== "") {
            for (let i = 0; i < b.cartelas.length; i++) {
                if (b.cartelas[i].owner === b.checkWin && b.check()) {
                    gameEnd = true;
                    winner = i;
                }
            }
            b.checkWin = "";
        }

        if (generateNumber) {
            let gen;
            do {
                gen = Math.trunc(Math.random() * b.max + 1);
            } while (b.sorteados[gen]);

            b.sorteados[gen] = true;
            b.sorteadosN.push(gen);
        }

        let toEdit = text + `\`\`\`${b.sorteadosN.join(' ')}\`\`\``;
        gamemsg.edit(toEdit).then(() => {
            if (gameEnd) {
                const member = b.msg.guild.members.find(a => a.id === b.cartelas[winner].owner);
                Bank.giveMoney(b.cartelas[winner].owner, b.prize());
                gamemsg.channel.send(`${member.user} Parabéns, você ganhou o bingo! Prêmio: \`$${b.prize()}\``);
                bingoCurrent = -1;
            } else
                setTimeout(tick, tickRate);
        });
    }
}