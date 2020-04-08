import { ReactionCollector, Message, ReactionEmoji, User, Collection, MessageReaction } from "discord.js";
import { Emojis, formatDate } from "../definitions";
import { Bank } from ".";

export let currentSorteio = false;

export function Sorteio(msg: Message, qnt: number, time: number): void {
    currentSorteio = true;
    let participantes: string[] = [];
    msg.channel.send(`@everyone Um novo sorteio foi criado com o valor de \`$${qnt}\` e vai ser iniciado em ${formatDate(time)}`)
        .then((message) => {
            if (message !== <Message>message) return;

            message.react(Emojis.yes)
                .then(() => {
                    const filter = (reaction: MessageReaction, user: User) => reaction.emoji.name === Emojis.yes && Bank.isRegistered(user.id);
                    let collector = message.createReactionCollector(filter, { time: time });;
                    collector.on('end', (collected: Collection<string, MessageReaction>) => {
                        collected.forEach(reaction => {
                            reaction.users.forEach(user => { msg.client.user.id !== user.id ? participantes.push(user.id) : null });
                        });

                        const winner = Math.floor(participantes.length * Math.random());
                        Bank.giveMoney(participantes[winner], qnt);
                        msg.channel.send(`Parabéns, <@${participantes[winner]}>! Você ganhou \`$${qnt}\`!`);
                        /*TODO: corrigir acoplamento de código*/
                        currentSorteio = false;
                    });
                });
        });
}
