"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var Cassino_1 = require("../../Cassino");
exports.default = {
    run: function (msg, args) {
        var result = Cassino_1.Bank.register(msg.author.id);
        if (result) {
            msg.channel.send(msg.author + " Voc\u00EA foi registrado com sucesso!");
        }
        else {
            msg.channel.send(msg.author + " Voc\u00EA j\u00E1 est\u00E1 registrado!");
        }
    },
    staff: false,
    aliases: ["register", "registrar"],
    shortHelp: "Te registra no Banco",
    longHelp: "Com este comando, você irá se registrar no Banco do servidor. Este é o primeiro passo para participar de eventos como a loteria, corrida de cavalos, etc",
    example: definitions_1.Server.prefix + "register"
};
