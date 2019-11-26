import { Command, Arguments, Server } from "../../definitions";
import { Message } from "discord.js";
import Moderation from "../../Moderation";
import { currentLoteria, Loteria } from "../../Cassino/loteria";

export default <Command>{
    run: (msg: Message, args: Arguments) => {
        if (!Moderation.isAdmin(msg.member)) return;
        if (currentLoteria === -1) {
            msg.channel.send(`${msg.author} Não existe nenhuma loteria iniciada!`);
            return;
        }

        const result = typeof currentLoteria !== 'number' ? <{ money: number, user: string }>currentLoteria.resultado() : { money: 0, user: "" };
        if (result === undefined) {
            msg.channel.send(`${msg.author} Loteria encerrada com 0 participantes!`);
            return;
        }

        msg.channel.send(`Parabéns, <@${result.user}>! Você acaba de ganhar \`$${result.money}\`!`);
        msg.channel.send(`Obrigado a todos os outros membros que participaram dessa loteria! Boa sorte na próxima para os outros participantes.`);
        Loteria.current = -1;
    },
    staff: true,
    aliases: ["resultado", "result"],
    shortHelp: "Finalize uma loteria e anuncie o vencedor",
    longHelp: "Finalize uma loteria e revele o resultado",
    example: `${Server.prefix}resultado`
};