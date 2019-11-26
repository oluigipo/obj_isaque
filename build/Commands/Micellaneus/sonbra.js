"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
exports.default = {
    run: function (msg, args) {
        msg.channel.send("https://cdn.discordapp.com/attachments/507552679946485770/558803280935780386/VID-20190319-WA0001_1.gif");
    },
    staff: false,
    aliases: ["sonbra", "screenshake"],
    shortHelp: "Sonbra e seu glorioso ScreenShake",
    longHelp: "Sonbra e seu glorioso ScreenShake",
    example: definitions_1.Server.prefix + "sonbra"
};
