import { Command, Arguments, Server } from "../../definitions";
import { Message } from "discord.js";
import { Bank } from "../../Cassino";

export default <Command>{
    run: (msg: Message, args: Arguments): void => {
        if (args.length < 2) {
            const qnt = 100 - Bank.messages(msg.author.id);
            msg.channel.send(`${msg.author} Faltam exatamente ${qnt} mensagens até o seu próximo prêmio.`);
        } else {
            const user = msg.mentions.members.first();
            const qnt = 100 - Bank.messages(user.id);
            msg.channel.send(`${msg.author} Faltam exatamente ${qnt} mensagens até o próximo prêmio do(a) ${user.user.tag}.`);
        }
    },
    staff: false,
    aliases: ["messages", "mensagens"],
    shortHelp: "Saiba quantas mensagens faltam para receber seu próximo prêmio",
    longHelp: "Veja quantas mensagens lhe faltam para receber seu próximo prêmio. A cada 100 mensagens, você recebe uma quantia de dinheiro (mensagens que forem enviadas no #playground não contarão)",
    example: `${Server.prefix}messages`
};