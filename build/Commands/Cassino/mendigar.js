"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var Cassino_1 = require("../../Cassino");
exports.default = {
    run: function (msg, args) {
        var result = Cassino_1.Bank.mendigar(msg.author.id);
        if (result === null) {
            msg.channel.send(msg.author + " Voc\u00EA n\u00E3o est\u00E1 registrado.");
        }
        else if (result < 0) {
            msg.channel.send(msg.author + " Voc\u00EA s\u00F3 poder\u00E1 mendigar de novo depois de " + definitions_1.formatDate(-result) + "!");
        }
        else if (result === 0) {
            msg.channel.send(msg.author + " Infelizmente ningu\u00E9m quis te doar nada.");
        }
        else {
            msg.channel.send(msg.author + " Parab\u00E9ns! Algu\u00E9m te doou `$" + result + "`!");
        }
    },
    staff: false,
    aliases: ["mendigar"],
    shortHelp: "Está com pouca grana? Não se preocupe, pois este comando existe para te ajudar",
    longHelp: "Mendigue um pouco de dinheiro. Vai que alguém te dá algo. Obs.: Você só pode mendigar uma vez por dia",
    example: definitions_1.Server.prefix + "mendigar"
};
