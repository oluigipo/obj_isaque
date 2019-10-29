"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Banco_1 = require("./Banco");
const Bank_1 = __importDefault(require("../Bank"));
const discordServer = __importStar(require("../../constants"));
class Sorteio {
    constructor(msg, qnt, time) {
        this.participantes = [];
        msg.react(discordServer.yesEmoji);
        this.qnt = qnt;
        const filter = (reaction, user) => reaction.emoji.name === discordServer.yesEmoji && Banco_1.Banco.isRegistered(user.id);
        this.collector = msg.createReactionCollector(filter, { time: time });
        ;
        this.collector.on('end', collected => {
            collected.forEach(reaction => {
                reaction.users.forEach(user => { msg.client.user.id !== user.id ? this.participantes.push(user.id) : null; });
            });
            const winner = Math.floor(this.participantes.length * Math.random());
            Banco_1.Banco.giveMoney(this.participantes[winner], this.qnt);
            msg.channel.send(`Parabéns, <@${this.participantes[winner]}>! Você ganhou \`$${this.qnt}\`!`);
            /*TODO: corrigir acoplamento de código*/
            Bank_1.default.sorteioCurrent = -1;
        });
    }
}
exports.default = Sorteio;
