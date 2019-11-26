"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var Cassino_1 = require("../../Cassino");
exports.default = {
    run: function (msg, args) {
        var result = Cassino_1.Bank.weekMoney(msg.author.id);
        if (result === 0) {
            msg.channel.send(msg.author + " Voc\u00EA n\u00E3o est\u00E1 registrado!");
        }
        else if (result < 0) {
            msg.channel.send(msg.author + " Voc\u00EA ainda n\u00E3o pode resgatar o pr\u00EAmio semanal! Ainda faltam " + definitions_1.formatDate(-result) + ".");
        }
        else {
            msg.channel.send(msg.author + " Voc\u00EA resgatou `$" + result + "`");
        }
    },
    staff: false,
    aliases: ["semanal"],
    shortHelp: "Resgate uma quantidade de dinheiro semanalmente",
    longHelp: "Resgate uma certa quantidade de dinheiro semanalmente",
    example: definitions_1.Server.prefix + "semanal"
};
