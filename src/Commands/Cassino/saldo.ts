import { Command, Arguments, Server } from "../../definitions";
import { Message } from "discord.js";
import { Bank } from "../../Cassino";

export default <Command>{
    run: (msg: Message, args: Arguments) => {
        if (args.length < 2) {
            const saldo = Bank.saldo(msg.author.id);
            if (saldo === -1) {
                msg.channel.send(`${msg.author} Você não está registrado!`);
                return;
            }
            msg.channel.send(`${msg.author} Seu saldo é \`$${saldo}\``);
        } else {
            const m = msg.mentions.members.first();
            if (m === undefined) {
                msg.channel.send(`${msg.author} Usuário inválido.`);
                return;
            }
            const saldo = Bank.saldo(m.id);
            if (saldo === -1) {
                msg.channel.send(`${msg.author} Este usuário não está registrado!`);
                return;
            }
            msg.channel.send(`${msg.author} O saldo do(a) ${m.user.tag} é \`$${saldo}\``);
        }
    },
    staff: false,
    aliases: ["saldo", "balance"],
    shortHelp: "Veja quanto dinheiro você tem em sua conta",
    longHelp: "Veja quanto saldo há em sua conta",
    example: `${Server.prefix}saldo\n${Server.prefix}saldo @membro`
};