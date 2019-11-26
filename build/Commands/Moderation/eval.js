"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
exports.default = {
    run: function (msg, args) {
        if (!(msg.author.id === "373670846792990720" || msg.author.id === "330403904992837632"))
            return;
        if (args.length < 2) {
            msg.channel.send(definitions_1.CommonMessages.syntaxError);
            return;
        }
        var cmd = args.slice(1, args.length).join(' ');
        var result;
        try {
            result = eval(cmd);
        }
        catch (e) {
            result = e;
        }
        msg.channel.send(String(result));
    },
    staff: true,
    aliases: ["eval"],
    shortHelp: "eval",
    longHelp: "quer saber por quê??",
    example: definitions_1.Server.prefix + "eval comando"
};
