"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var Moderation_1 = __importDefault(require("./../../Moderation"));
var Cassino_1 = require("../../Cassino");
exports.default = {
    run: function (msg, args) {
        if (args.length < 3) {
            msg.channel.send(msg.author + " Informe o usu\u00E1rio que deseja punir e quanto deseja descontar dele.");
            return;
        }
        var qnt = Number(args[1]);
        if (isNaN(qnt) || qnt !== Math.trunc(qnt)) {
            msg.channel.send(msg.author + " Quantidade inv\u00E1lida.");
            return;
        }
        msg.mentions.members.forEach(function (m) {
            if (Moderation_1.default.isAdmin(m))
                return;
            var result = Cassino_1.Bank.userPunish(m.id, qnt);
            if (result) {
                msg.channel.send(msg.author + " O usu\u00E1rio " + m.user.tag + " foi punido com sucesso.");
            }
            else {
                msg.channel.send(msg.author + " N\u00E3o foi poss\u00EDvel punir o usu\u00E1rio " + m.user.tag + ". Talvez ele n\u00E3o esteja registrado ainda!");
            }
        });
    },
    staff: true,
    aliases: ["punish", "punir"],
    shortHelp: "Puna um membro confiscando parte de seu dinheiro",
    longHelp: "Puna um membro confiscando um pouco de seu dinheiro (ou todo seu dinheiro :kappa:)",
    example: definitions_1.Server.prefix + "punish quantidade @membro"
};
