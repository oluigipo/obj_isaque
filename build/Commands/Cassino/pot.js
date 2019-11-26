"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var loteria_1 = require("../../Cassino/loteria");
exports.default = {
    run: function (msg, args) {
        if (loteria_1.currentLoteria === -1) {
            msg.channel.send(msg.author + " N\u00E3o existe nenhuma loteria iniciada!");
            return;
        }
        var result = loteria_1.currentLoteria.pot();
        msg.channel.send(msg.author + " A quantidade de dinheiro acumulada \u00E9 " + result);
    },
    staff: false,
    aliases: ["pot"],
    shortHelp: "Veja quanto dinheiro está acumulado numa loteria",
    longHelp: "Veja quanto dinheiro está acumulado numa loteria acontecendo agora",
    example: definitions_1.Server.prefix + "pot"
};
