"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var loteria_1 = require("../../Cassino/loteria");
exports.default = {
    run: function (msg, args) {
        if (loteria_1.currentLoteria !== -1) {
            msg.channel.send(msg.author + " J\u00E1 existe uma loteria rolando!");
            return;
        }
        if (args.length < 2) {
            msg.channel.send(msg.author + " Informe quanto custar\u00E1 cada bilhete da loteria!");
            return;
        }
        var preco = Number(args[1]);
        if (isNaN(preco) || preco <= 0 || preco !== Math.trunc(preco)) {
            msg.channel.send(msg.author + " Pre\u00E7o dos bilhetes inv\u00E1lido!");
            return;
        }
        loteria_1.Loteria.setCurrent(new loteria_1.Loteria(Number(args[1])));
        msg.channel.send(msg.author + " Loteria iniciada!");
    },
    staff: true,
    aliases: ["loteria"],
    shortHelp: "Inicie uma loteria",
    longHelp: "Inicie uma loteria",
    example: definitions_1.Server.prefix + "loteria valorDeCadaBilhete"
};
