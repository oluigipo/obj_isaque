"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var sorteio_1 = require("../../Cassino/sorteio");
exports.default = {
    run: function (msg, args) {
        if (sorteio_1.currentSorteio) {
            msg.channel.send(msg.author + " J\u00E1 existe um sorteio rolando!");
            return;
        }
        if (args.length < 3) {
            msg.channel.send(msg.author + " \u00C9 necess\u00E1rio dizer quanto dinheiro ser\u00E1 sorteado e quanto tempo durar\u00E1 (em segundos) este sorteio!");
            return;
        }
        var qnt = Number(args[1]);
        if (isNaN(qnt) || qnt <= 0 || qnt !== Math.trunc(qnt)) {
            msg.channel.send(msg.author + " Quantidade inv\u00E1lida.");
            return;
        }
        var time = Number(args[2]) * 1000;
        if (isNaN(time) || time <= 0 || time !== Math.trunc(time)) {
            msg.channel.send(msg.author + " Dura\u00E7\u00E3o inv\u00E1lida.");
            return;
        }
        sorteio_1.Sorteio(msg, qnt, time);
    },
    staff: true,
    aliases: ["sorteio"],
    shortHelp: "Inicie um sorteio",
    longHelp: "Inicie um sorteio! Um sorteio consiste em entregar uma quantidade de dinheiro (que veio do nada) para algum membro aleatório que reagir a sua mensagem",
    example: definitions_1.Server.prefix + "sorteio quantidade dura\u00E7\u00E3oEmSegundos"
};
