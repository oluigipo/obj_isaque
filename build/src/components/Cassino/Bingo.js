"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discordServer = __importStar(require("../../constants"));
const Bank_1 = __importDefault(require("../Bank"));
const Banco_1 = require("./Banco");
class Bingo {
    constructor(msg, timeToRun, size, prize) {
        this.cartelas = [];
        this.sorteados = [];
        this.checkWin = "";
        this.max = 60;
        this.sorteadosN = [];
        this.size = size;
        this.timeToRun = timeToRun * 1000; // TRansformar em MS, coisa que tu não fez.
        this.msg = msg;
        this.prizeval = prize;
        bingoRun(this);
    }
    /**
         * @returns {boolean}
         */
    check() {
        const index = this.cartelas.findIndex(c => c.owner === this.checkWin);
        let confirm = this.size;
        for (let i = 0; i < this.cartelas[index].cartela.length; i++) {
            let confirm2 = this.size;
            for (let j = 0; j < this.cartelas[index].cartela.length; j++) {
                if (j === 0)
                    confirm2 = this.size;
                if (this.sorteados[this.cartelas[index].cartela[i + j * this.size]])
                    confirm2--;
                if (confirm2 === 0)
                    return true;
            }
            if (i % this.size === 0)
                confirm = this.size;
            if (this.sorteados[this.cartelas[index].cartela[i]])
                confirm--;
            if (confirm === 0)
                return true;
        }
        return false;
    }
    prize() {
        return this.prizeval;
    }
}
exports.default = Bingo;
function bingoRun(b) {
    let gamemsg;
    let tickCount = 0;
    let winner = -1;
    let gameEnd = false;
    let text;
    const numberPerTick = 5;
    const tickRate = 100;
    initialize();
    // Gera as paradinhas do bingo (cartelas) e manda as msgs na dm dos users
    function initialize() {
        for (let i = 0; i < b.max; i++) {
            b.sorteados[i] = false;
        }
        const filter = (reaction, user) => reaction.emoji.name === discordServer.yesEmoji && user.id !== b.msg.client.user.id && Banco_1.Banco.isRegistered(user.id);
        b.msg.channel.send(`${b.msg.author} O bingo iniciará em ${Bank_1.default.formatDate(b.timeToRun)}! Prêmio: \`${b.prizeval}\``)
            .then((message) => {
            message.react(discordServer.yesEmoji);
            const collector = message.createReactionCollector(filter, { time: b.timeToRun });
            collector.on("end", collection => {
                collection.forEach(reaction => {
                    reaction.users.forEach(user => {
                        if (user.id === b.msg.client.user.id)
                            return;
                        if (Banco_1.Banco.isRegistered(user.id)) {
                            const car = generateCartela();
                            b.cartelas.push({ owner: user.id, cartela: car });
                            user.createDM()
                                .then(dm => {
                                dm.send(`${fortmatCartela(car)}`).then(() => { dm.delete(); });
                            });
                        }
                        else {
                            b.msg.channel.send(`${user} Você não está registrado.`);
                        }
                    });
                });
                start();
            });
        });
    }
    function fortmatCartela(cartela) {
        let text = "```";
        for (let i = 0; i < cartela.length; i++) {
            if (i % b.size === 0)
                text += "\n";
            text += `${cartela[i] + ' '.repeat(3 - String(cartela[i]).length)}`;
        }
        text += "\n```";
        return text;
    }
    function generateCartela() {
        let cartela = [];
        let generated = [];
        for (let i = 0; i < b.size * b.size; i++) {
            let gen;
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
            gamemsg = message;
            setTimeout(tick, tickRate);
        });
    }
    function tick() {
        let generateNumber = (tickCount === 0);
        tickCount = (tickCount + 1) % numberPerTick;
        console.log(generateNumber);
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
                Banco_1.Banco.giveMoney(b.cartelas[winner].owner, b.prize());
                gamemsg.channel.send(`${member.user} Parabéns, você ganhou o bingo! Prêmio: \`$${b.prize()}\``);
                Bank_1.default.bingoCurrent = -1;
            }
            else
                setTimeout(tick, tickRate);
        });
    }
}
