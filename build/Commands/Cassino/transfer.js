"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var Cassino_1 = require("../../Cassino");
exports.default = {
    run: function (msg, args) {
        if (args.length < 3) {
            msg.channel.send(msg.author + " Sintaxe inv\u00E1lida. Consulte o `!!help`.");
            return;
        }
        var member = msg.mentions.members.first();
        if (member === undefined) {
            msg.channel.send(msg.author + " Usu\u00E1rio inv\u00E1lido.");
            return;
        }
        var qnt = Number(args[1]);
        if (isNaN(qnt) || qnt <= 0 || qnt !== Math.trunc(qnt)) {
            msg.channel.send(msg.author + " Valor inv\u00E1lido.");
            return;
        }
        if (member.id === msg.author.id) {
            msg.channel.send(msg.author + " Voc\u00EA tem algum problema por acaso?");
            return;
        }
        var result = Cassino_1.Bank.transfer(msg.author.id, member.id, qnt);
        switch (result) {
            case -2:
                msg.channel.send(msg.author + " Usu\u00E1rio inv\u00E1lido.");
                break;
            case -1:
                msg.channel.send(msg.author + " Voc\u00EA n\u00E3o est\u00E1 registrado!");
                break;
            case 0:
                msg.channel.send(msg.author + " Voc\u00EA n\u00E3o tem dinheiro o suficiente!");
                break;
            case 1:
                msg.channel.send(msg.author + " Voc\u00EA transferiu `" + qnt + "` para " + member.user.tag + "!");
                break;
        }
    },
    staff: true,
    aliases: ["transfer", "transferir"],
    shortHelp: "Transfira dinheiro para outro usuário",
    longHelp: "Transfira dinheiro para outro usuário",
    example: "" + definitions_1.Server.prefix
};
