"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var Cassino_1 = require("../../Cassino");
exports.default = {
    run: function (msg, args) {
        if (args.length < 2) {
            var qnt = 100 - Cassino_1.Bank.messages(msg.author.id);
            msg.channel.send(msg.author + " Faltam exatamente " + qnt + " mensagens at\u00E9 o seu pr\u00F3ximo pr\u00EAmio.");
        }
        else {
            var user = msg.mentions.members.first();
            var qnt = 100 - Cassino_1.Bank.messages(user.id);
            msg.channel.send(msg.author + " Faltam exatamente " + qnt + " mensagens at\u00E9 o pr\u00F3ximo pr\u00EAmio do(a) " + user.user.tag + ".");
        }
    },
    staff: false,
    aliases: ["messages", "mensagens"],
    shortHelp: "Saiba quantas mensagens faltam para receber seu próximo prêmio",
    longHelp: "Veja quantas mensagens lhe faltam para receber seu próximo prêmio. A cada 100 mensagens, você recebe uma quantia de dinheiro (mensagens que forem enviadas no #playground não contarão)",
    example: definitions_1.Server.prefix + "messages"
};
