import { Banco } from "./Banco";
import Bank from "../Bank";
import { Message, ReactionCollector } from 'discord.js';
import * as discordServer from '../../constants';

export default class Sorteio {
    participantes: string[] = [];
    qnt: number;
    collector: ReactionCollector;
    constructor(msg: Message, qnt: number, time: number) {
        msg.react(discordServer.yesEmoji);
        this.qnt = qnt;
        const filter = (reaction, user) => reaction.emoji.name === discordServer.yesEmoji && Banco.isRegistered(user.id);
        this.collector = msg.createReactionCollector(filter, { time: time });;
        this.collector.on('end', collected => {
            collected.forEach(reaction => {
                reaction.users.forEach(user => { msg.client.user.id !== user.id ? this.participantes.push(user.id) : null });
            });

            const winner = Math.floor(this.participantes.length * Math.random());
            Banco.giveMoney(this.participantes[winner], this.qnt);
            msg.channel.send(`Parabéns, <@${this.participantes[winner]}>! Você ganhou \`$${this.qnt}\`!`);
            /*TODO: corrigir acoplamento de código*/
            Bank.sorteioCurrent = -1;
        });
    }
}