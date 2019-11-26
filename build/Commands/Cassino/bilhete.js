"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var loteria_1 = require("../../Cassino/loteria");
exports.default = {
    run: function (msg, args) {
        if (loteria_1.currentLoteria === -1) {
            msg.channel.send(msg.author + " N\u00E3o existe nenhuma loteria iniciada!");
            return;
        }
        if (args.length < 2) {
            msg.channel.send(msg.author + " Informe quantos bilhetes deseja comprar. Esta \u00E9 uma compra \u00FAnica!");
            return;
        }
        var qnt = Number(args[1]);
        if (isNaN(qnt) || qnt <= 0 || qnt !== Math.trunc(qnt)) {
            msg.channel.send(msg.author + " Quantidade de bilhetes inv\u00E1lida.");
            return;
        }
        var result = typeof loteria_1.currentLoteria !== 'number' ? loteria_1.currentLoteria.bilhete(msg.author.id, qnt) : 0;
        if (result < 0) {
            msg.channel.send(msg.author + " Voc\u00EA n\u00E3o est\u00E1 registrado ou j\u00E1 usou o `" + definitions_1.Server.prefix + "bilhete` antes!");
        }
        else if (result === 0) {
            msg.channel.send(msg.author + " Infelizmente voc\u00EA n\u00E3o p\u00F4de comprar nenhum bilhete. <:Zgatotristepo:589449862697975868>");
        }
        else if (result < qnt) {
            msg.channel.send(msg.author + " Infelizmente voc\u00EA n\u00E3o havia dinheiro suficiente para comprar esta quantidade de bilhetes. Ent\u00E3o voc\u00EA acabou comprando somente " + result + ".");
        }
        else {
            msg.channel.send(msg.author + " Voc\u00EA comprou " + qnt + " bilhete(s). Boa sorte!");
        }
    },
    staff: false,
    aliases: ["bilhete"],
    shortHelp: "Compre bilhetes para participar da loteria. Quanto mais você compra, maiores as suas chances",
    longHelp: "Compre biletes para participar da loteria. Quantos mais você comprar, maiores as suas chances de vencer.",
    example: definitions_1.Server.prefix + "bilhete quantidade"
};
