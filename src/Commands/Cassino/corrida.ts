import { Command, Arguments, Server, CommonMessages } from "../../definitions";
import { Message, TextChannel } from "discord.js";
import Corrida from "../../Cassino/corrida";

export default <Command>{
    run: (msg: Message, args: Arguments): void => {
        if (args.length < 5) {
            msg.channel.send(`${msg.author} Sintaxe inválida!`);
            return;
        }

        const maxUsers = Number(args[1]);
        if (maxUsers === NaN) {
            msg.channel.send(`${msg.author} Quantidade máxima de participantes inválida!`);
            return;
        }

        const timeToRun = Number(args[2]);
        if (timeToRun === NaN || timeToRun < 10) {
            msg.channel.send(`${msg.author} Tempo para começar inválido!`);
            return;
        }

        const duration = Number(args[3]);
        if (duration === NaN || duration < 5 || duration > 100) {
            msg.channel.send(`${msg.author} Duração inválida!`);
            return;
        }

        const cost = Number(args[4]);
        if (cost === NaN || cost < 0) {
            msg.channel.send(`${msg.author} Aposta inválida!`);
            return;
        }

        Corrida(msg, maxUsers, timeToRun, duration, cost);

    },
    staff: true,
    aliases: ["corrida"],
    shortHelp: "Inicie uma corrida de cavalos",
    longHelp: "Inicie uma belíssima corrida de cavalos (Obs: O tempo é calculado em segundos!)",
    example: `${Server.prefix}corrida maxDeParticipantes tempoAtéComeçar tamanhoDaPista aposta`
};