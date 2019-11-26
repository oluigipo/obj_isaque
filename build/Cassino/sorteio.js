"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../definitions");
var _1 = require(".");
exports.currentSorteio = false;
function Sorteio(msg, qnt, time) {
    exports.currentSorteio = true;
    var participantes = [];
    msg.react(definitions_1.Emojis.yes);
    var filter = function (reaction, user) { return reaction.emoji.name === definitions_1.Emojis.yes && _1.Bank.isRegistered(user.id); };
    var collector = msg.createReactionCollector(filter, { time: time });
    ;
    collector.on('end', function (collected) {
        collected.forEach(function (reaction) {
            reaction.users.forEach(function (user) { msg.client.user.id !== user.id ? participantes.push(user.id) : null; });
        });
        var winner = Math.floor(participantes.length * Math.random());
        _1.Bank.giveMoney(participantes[winner], qnt);
        msg.channel.send("Parab\u00E9ns, <@" + participantes[winner] + ">! Voc\u00EA ganhou `$" + qnt + "`!");
        /*TODO: corrigir acoplamento de código*/
        exports.currentSorteio = false;
    });
}
exports.Sorteio = Sorteio;
