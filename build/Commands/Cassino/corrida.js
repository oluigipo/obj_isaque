"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var corrida_1 = __importDefault(require("../../Cassino/corrida"));
exports.default = {
    run: function (msg, args) {
        if (args.length < 5) {
            msg.channel.send(msg.author + " Sintaxe inv\u00E1lida!");
            return;
        }
        var maxUsers = Number(args[1]);
        if (maxUsers === NaN) {
            msg.channel.send(msg.author + " Quantidade m\u00E1xima de participantes inv\u00E1lida!");
            return;
        }
        var timeToRun = Number(args[2]);
        if (timeToRun === NaN || timeToRun < 10) {
            msg.channel.send(msg.author + " Tempo para come\u00E7ar inv\u00E1lido!");
            return;
        }
        var duration = Number(args[3]);
        if (duration === NaN || duration < 5) {
            msg.channel.send(msg.author + " Dura\u00E7\u00E3o inv\u00E1lida!");
            return;
        }
        var cost = Number(args[4]);
        if (cost === NaN || cost < 0) {
            msg.channel.send(msg.author + " Aposta inv\u00E1lida!");
            return;
        }
        corrida_1.default(msg, maxUsers, timeToRun, duration, cost);
    },
    staff: true,
    aliases: ["corrida"],
    shortHelp: "Inicie uma corrida de cavalos",
    longHelp: "Inicie uma belíssima corrida de cavalos (Obs: O tempo é calculado em segundos!)",
    example: definitions_1.Server.prefix + "corrida maxDeParticipantes tempoAt\u00E9Come\u00E7ar tamanhoDaPista aposta"
};
