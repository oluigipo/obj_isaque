"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
exports.default = {
    run: function (msg, args) {
        if (args.length < 2) {
            msg.channel.send(definitions_1.CommonMessages.syntaxError);
            return;
        }
        msg.mentions.members.forEach(function (m) {
            if (m.kickable) {
                m.kick();
                msg.channel.send("O usu\u00E1rio " + m.user.tag + " foi kickado.").catch(console.error);
            }
            else {
                msg.channel.send("N\u00E3o \u00E9 poss\u00EDvel kickar o usu\u00E1rio " + m.user.tag + ".").catch(console.error);
            }
        });
    },
    staff: true,
    aliases: ["kick"],
    shortHelp: "Kickar usuários",
    longHelp: "Kicka um ou mais usuários do servidor",
    example: definitions_1.Server.prefix + "kick @user\n" + definitions_1.Server.prefix + "kick @user1 @user2..."
};
