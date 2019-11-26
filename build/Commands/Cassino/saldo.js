"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var Cassino_1 = require("../../Cassino");
exports.default = {
    run: function (msg, args) {
        if (args.length < 2) {
            var saldo = Cassino_1.Bank.saldo(msg.author.id);
            if (saldo === -1) {
                msg.channel.send(msg.author + " Voc\u00EA n\u00E3o est\u00E1 registrado!");
                return;
            }
            msg.channel.send(msg.author + " Seu saldo \u00E9 `$" + saldo + "`");
        }
        else {
            var m = msg.mentions.members.first();
            if (m === undefined) {
                msg.channel.send(msg.author + " Usu\u00E1rio inv\u00E1lido.");
                return;
            }
            var saldo = Cassino_1.Bank.saldo(m.id);
            if (saldo === -1) {
                msg.channel.send(msg.author + " Este usu\u00E1rio n\u00E3o est\u00E1 registrado!");
                return;
            }
            msg.channel.send(msg.author + " O saldo do(a) " + m.user.tag + " \u00E9 `$" + saldo + "`");
        }
    },
    staff: false,
    aliases: ["saldo", "balance"],
    shortHelp: "Veja quanto dinheiro você tem em sua conta",
    longHelp: "Veja quanto saldo há em sua conta",
    example: definitions_1.Server.prefix + "saldo\n" + definitions_1.Server.prefix + "saldo @membro"
};
