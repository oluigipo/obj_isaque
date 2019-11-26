"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var Cassino_1 = require("../../Cassino");
exports.default = {
    run: function (msg, args) {
        Cassino_1.Bank.jsonOpen();
        var list = __spreadArrays(Cassino_1.Bank.json.users);
        Cassino_1.Bank.jsonClose();
        list.sort(function (a, b) { return b.money - a.money; });
        var text = "Rank de usuários (ordem: Nível de Burguesia):\n```";
        list.forEach(function (u, index) {
            if (index >= 10)
                return;
            var member = msg.guild.members.find(function (a) { return a.id === u.userid; });
            text += index + 1 + 'º' + (index === 9 ? ' ' : '  ') + "- " + member.user.tag + "\n";
        });
        text += "```";
        msg.channel.send(text);
    },
    staff: false,
    aliases: ["rank"],
    shortHelp: "Veja quais são os maiores burgueses do servidor",
    longHelp: "Saiba qual é o rank das pessoas mais ricas do servidor",
    example: definitions_1.Server.prefix + "rank"
};
