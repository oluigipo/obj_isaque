"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
exports.default = {
    run: function (msg, args) {
        if (args.length < 2) {
            msg.channel.send(definitions_1.CommonMessages.syntaxError);
            return;
        }
        var qnt = 1;
        if (args.length > 2 && Number(args[2]) !== NaN)
            qnt = Math.max(Math.min(Number(args[2]), 68), 1);
        var e = msg.guild.emojis.find(function (a) { return a.name === args[1]; });
        if (e === null || e === undefined) {
            msg.channel.send("O emoji `" + args[1] + "` \u00E9 inv\u00E1lido.");
            return;
        }
        var name = msg.member.nickname === null ? msg.author.username : msg.member.nickname;
        if (msg.author.id === "338717274032701460" /* ID do luxuria */)
            name = "raquel";
        var image = msg.author.avatarURL;
        var channel = msg.channel;
        channel.createWebhook(name, image)
            .then(function (w) {
            w.send(("" + e).repeat(qnt)).then(function () { return w.delete(); });
        }).catch(function (a) { return msg.channel.send(a); });
        msg.delete();
    },
    staff: false,
    aliases: ["emoji"],
    shortHelp: "Envia um emoji por ti",
    longHelp: "Envia um emoji por ti usando webhooks (Número máximo de emojis por comando: 68)",
    example: definitions_1.Server.prefix + "emoji kappa\n" + definitions_1.Server.prefix + "emoji jotaro 5"
};
