"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var velha_1 = __importDefault(require("../../Cassino/velha"));
var Spot;
(function (Spot) {
    Spot[Spot["X"] = 0] = "X";
    Spot[Spot["O"] = 1] = "O";
    Spot[Spot["FREE"] = 2] = "FREE";
})(Spot || (Spot = {}));
exports.default = {
    run: function (msg, args) {
        if (args.length === 3) {
            if (velha_1.default.isPlaying(msg.author.id)) {
                msg.channel.send(msg.author + " Voc\u00EA j\u00E1 est\u00E1 em um jogo!");
                return;
            }
            var other = msg.mentions.members.first();
            if (velha_1.default.isPlaying(other.user.id)) {
                msg.channel.send(msg.author + " Este usu\u00E1rio j\u00E1 est\u00E1 em um jogo!");
                return;
            }
            var price = Number(args[1]);
            if (price === NaN || price < 0) {
                msg.channel.send(msg.author + " Aposta inv\u00E1lida!");
                return;
            }
            var result = velha_1.default.makeRequest(msg.author.id, other.user.id, price);
            if (!result) {
                msg.channel.send("Algo deu errado com o jogo da velha... <@373670846792990720> ARRUMA ESSA BAGA\u00C7A");
                return;
            }
            msg.channel.send(other + " Digite `" + definitions_1.Server.prefix + "velha` para aceitar a partida");
        }
        else if (args.length === 2) {
            if (args[1] === "table") {
                var t = velha_1.default.getTable(msg.author.id);
                if (t === -1) {
                    msg.channel.send(msg.author + " Voc\u00EA n\u00E3o est\u00E1 em nenhuma partida!");
                    return;
                }
                msg.channel.send("" + msg.author + __mkstr(t));
                return;
            }
            var pos = Number(args[1]);
            if (pos === NaN || pos < 1 || pos > 9) {
                msg.channel.send(msg.author + " Posi\u00E7\u00E3o inv\u00E1lida!");
                return;
            }
            var result = velha_1.default.makePlay(msg.author.id, pos);
            switch (result) {
                case 0:
                    msg.channel.send(msg.author + " Esta posi\u00E7\u00E3o n\u00E3o est\u00E1 livre!");
                    break;
                case -1:
                    msg.channel.send(msg.author + " Voc\u00EA n\u00E3o est\u00E1 em nenhum jogo!");
                    break;
                default:
                    if (__is(result)) {
                        var str = __mkstr(result);
                        msg.channel.send(str);
                    }
                    else {
                        var str = (result.p === -1 ? "Deu velha!" : "O(a) <@" + result.p + "> venceu o jogo!");
                        str += __mkstr(result.w);
                        msg.channel.send(str);
                    }
                    break;
            }
        }
        else {
            if (velha_1.default.acceptRequest(msg.author.id)) {
                msg.channel.send(msg.author + " Que os jogos comecem! D\u00EA um `" + definitions_1.Server.prefix + "velha table`");
            }
            else {
                msg.channel.send(msg.author + " Ningu\u00E9m te chamou para uma partida <:Zgatotristepo:589449862697975868>");
            }
        }
        function __is(r) {
            return r.length !== undefined;
        }
        function __g(p) {
            return p === Spot.O ? 'O' : (p === Spot.X ? 'X' : ' ');
        }
        function __mkstr(t) {
            var str = "```\n";
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
    example: definitions_1.Server.prefix + "velha aposta @member | Chamar um usu\u00E1rio para jogar\n" + definitions_1.Server.prefix + "velha posi\u00E7\u00E3o[1-9]   | Marcar uma posi\u00E7\u00E3o\n" + definitions_1.Server.prefix + "velha                | Aceitar um convite de jogo"
};
