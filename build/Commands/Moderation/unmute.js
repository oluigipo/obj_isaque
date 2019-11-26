"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var Moderation_1 = __importDefault(require("../../Moderation"));
exports.default = {
    run: function (msg, args) {
        if (args.length < 2) {
            msg.channel.send(definitions_1.CommonMessages.syntaxError);
            return;
        }
        msg.mentions.members.forEach(function (m) {
            var result = Moderation_1.default.unmute(msg.client, m.user.id);
            if (result) {
                msg.channel.send("O usu\u00E1rio " + m.user.tag + " foi desmutado com sucesso.");
            }
            else {
                msg.channel.send("O usu\u00E1rio " + m.user.tag + " n\u00E3o est\u00E1 mutado ou tem algo de errado...");
            }
        });
    },
    aliases: ["unmute"],
    longHelp: "Desmuta um ou mais usuários no servidor",
    shortHelp: "Desmutar usuários",
    example: definitions_1.Server.prefix + "unmute @user\n" + definitions_1.Server.prefix + "unmute @user1 @user2...",
    staff: true
};
