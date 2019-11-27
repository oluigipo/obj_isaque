"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
exports.default = {
    run: function (msg, args) {
        if (msg.channel.id !== definitions_1.Channels.shitpost)
            return;
        msg.channel.send("ULO" + 'O'.repeat(Math.floor(Math.random() * 201)) + "N");
    },
    staff: false,
    aliases: ["ulon"],
    shortHelp: "ULOOOOON",
    longHelp: "ULOOOOOOOOOOOOOOOOOON",
    example: definitions_1.Server.prefix + "ulon"
};
