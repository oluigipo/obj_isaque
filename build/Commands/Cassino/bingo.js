"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var bingo_1 = require("../../Cassino/bingo");
var Moderation_1 = __importDefault(require("../../Moderation"));
exports.default = {
    run: function (msg, args) {
        if (typeof (bingo_1.bingoCurrent) !== 'number') {
            bingo_1.bingoCurrent.checkWin = msg.author.id;
        }
        else {
            if (!Moderation_1.default.isAdmin(msg.member))
                return;
            if (args.length < 4) {
                msg.channel.send(msg.author + " Sintaxe incorreta!");
                return;
            }
            var timeToRun = Number(args[1]);
            if (timeToRun === NaN || timeToRun < 0) {
                msg.channel.send(msg.author + " Tempo incorreto!");
                return;
            }
            var size = Number(args[2]);
            if (size === NaN || size < 1) {
                msg.channel.send(msg.author + " Tamanho da cartela incorreta!");
                return;
            }
            var prize = Number(args[3]);
            if (prize === NaN || prize < 5) {
                msg.channel.send(msg.author + " Valor do pr\u00EAmio incorreto!");
                return;
            }
            bingo_1.Bingo.setCurrent(new bingo_1.Bingo(msg, timeToRun, size, prize));
        }
    },
    staff: true,
    aliases: ["bingo"],
    shortHelp: "Inicie uma partida de bingo",
    longHelp: "Inicie uma partida de bingo. Para ganhar é necessário fazer uma linha ou uma coluna",
    example: definitions_1.Server.prefix + "bingo tempoAt\u00E9Come\u00E7ar tamanhoDaTabela premio"
};
