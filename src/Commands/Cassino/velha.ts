import { Command, Arguments, Server } from "../../definitions";
import { Message } from "discord.js";
import Velha from "../../Cassino/velha";

enum Spot {
    X, O, FREE
}

export default <Command>{
    run: (msg: Message, args: Arguments): void => {
        if (args.length === 3) {
            if (Velha.isPlaying(msg.author.id)) {
                msg.channel.send(`${msg.author} Você já está em um jogo!`);
                return;
            }

            let other = msg.mentions.members.first();

            if (Velha.isPlaying(other.user.id)) {
                msg.channel.send(`${msg.author} Este usuário já está em um jogo!`);
                return;
            }

            let price = Number(args[1]);
            if (price === NaN || price < 0) {
                msg.channel.send(`${msg.author} Aposta inválida!`);
                return;
            }

            let result = Velha.makeRequest(msg.author.id, other.user.id, price);
            if (!result) {
                msg.channel.send(`${msg.author} Não foi possível chamar este usuário para jogar. Talvez você ou ele não estejam registrados ou algum de vocês não possui dinheiro o suficiente para esta aposta.`);
                return;
            }

            msg.channel.send(`${other} Digite \`${Server.prefix}velha\` para aceitar a partida`);
        } else if (args.length === 2) {
            if (args[1] === "table") {
                let t = Velha.getTable(msg.author.id);
                if (t === -1) {
                    msg.channel.send(`${msg.author} Você não está em nenhuma partida!`);
                    return;
                }
                msg.channel.send(`${msg.author}${__mkstr(t)}`);
                return;
            }

            if (args[1] === "cancel") {
                let t = Velha.cancelMatch(msg.author.id);
                if (t === -1) {
                    msg.channel.send(`${msg.author} Você não está em nenhuma partida!`);
                } else if (t === 1) {
                    msg.channel.send(`${msg.author} Você cancelou o convite de jogo!`);
                } else {
                    msg.channel.send(`${msg.author} Você desistiu de uma partida, logo irá pagar o valor da aposta para o outro jogador!`);
                }
                return;
            }

            let pos = Number(args[1]);
            if (pos === NaN || pos < 1 || pos > 9) {
                msg.channel.send(`${msg.author} Posição inválida!`);
                return;
            }

            let result = Velha.makePlay(msg.author.id, pos - 1);

            switch (result) {
                case 0:
                    msg.channel.send(`${msg.author} Esta posição não está livre!`);
                    break;
                case -1:
                    msg.channel.send(`${msg.author} Você não está em nenhum jogo ou não é a sua vez!`);
                    break;
                default:
                    if (__is(result)) {
                        let str = __mkstr(result);
                        msg.channel.send(str);
                    } else {
                        let str = (result.p === -1 ? "Deu velha!" : `O(a) <@${result.p}> venceu o jogo!`);
                        str += __mkstr(result.w);
                        msg.channel.send(str);
                    }
                    break;
            }
        } else {
            if (Velha.acceptRequest(msg.author.id)) {
                msg.channel.send(`${msg.author} Que os jogos comecem! Dê um \`${Server.prefix}velha table\``);
            } else {
                msg.channel.send(`${msg.author} Ninguém te chamou para uma partida <:Zgatotristepo:589449862697975868>`);
            }
        }

        function __is(r: any): r is Spot[] {
            return r.length !== undefined;
        }

        function __g(p: Spot): string {
            return p === Spot.O ? 'O' : (p === Spot.X ? 'X' : ' ');
        }

        function __mkstr(t: Spot[]): string {
            let str = "```\n";

            str += __g(t[0]) + " | " + __g(t[1]) + " | " + __g(t[2]);
            str += "\n--+---+--\n";
            str += __g(t[3]) + " | " + __g(t[4]) + " | " + __g(t[5]);
            str += "\n--+---+--\n";
            str += __g(t[6]) + " | " + __g(t[7]) + " | " + __g(t[8]);

            str += "\n```";
            return str;
        }
    },
    staff: false,
    aliases: ["velha", "tictactoe"],
    shortHelp: "Jogo da velha apostado",
    longHelp: "Aposte dinheiro em um jogo da velha (ou tic-tac-toe). A cartela é representada dessa maneira: \`\`\`\n1 | 2 | 3\n---------\n4 | 5 | 6\n---------\n7 | 8 | 9\n```Cada jogador escolherá um lugar para jogar escolhendo um número da cartela",
    example: `${Server.prefix}velha aposta @member | Chamar um usuário para jogar\n${Server.prefix}velha posição[1-9]   | Marcar uma posição\n${Server.prefix}velha                | Aceitar um convite de jogo\n${Server.prefix}velha table          | Veja como está a partida atual`
};