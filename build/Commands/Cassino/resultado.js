"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var Moderation_1 = __importDefault(require("../../Moderation"));
var loteria_1 = require("../../Cassino/loteria");
exports.default = {
    run: function (msg, args) {
        if (!Moderation_1.default.isAdmin(msg.member))
            return;
        if (loteria_1.currentLoteria === -1) {
            msg.channel.send(msg.author + " N\u00E3o existe nenhuma loteria iniciada!");
            return;
        }
        var result = typeof loteria_1.currentLoteria !== 'number' ? loteria_1.currentLoteria.resultado() : { money: 0, user: "" };
        if (result === undefined) {
            msg.channel.send(msg.author + " Loteria encerrada com 0 participantes!");
            return;
        }
        msg.channel.send("Parab\u00E9ns, <@" + result.user + ">! Voc\u00EA acaba de ganhar `$" + result.money + "`!");
        msg.channel.send("Obrigado a todos os outros membros que participaram dessa loteria! Boa sorte na pr\u00F3xima para os outros participantes.");
        loteria_1.Loteria.setCurrent(-1);
    },
    staff: true,
    aliases: ["resultado", "result"],
    shortHelp: "Finalize uma loteria e anuncie o vencedor",
    longHelp: "Finalize uma loteria e revele o resultado",
    example: definitions_1.Server.prefix + "resultado"
};
