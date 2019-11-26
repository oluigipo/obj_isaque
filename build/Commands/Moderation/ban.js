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
            var result = Moderation_1.default.ban(msg.client, m.user.id);
            if (result) {
                msg.channel.send(msg.author + " O usu\u00E1rio " + m.user.tag + " foi banido com sucesso.");
            }
            else {
                msg.channel.send(msg.author + " O usu\u00E1rio " + m.user.tag + " n\u00E3o p\u00F4de ser banido.");
            }
        });
    },
    staff: true,
    aliases: ["ban"],
    shortHelp: "Banir usuários",
    longHelp: "Bane um ou mais usuários do servidor",
    example: definitions_1.Server.prefix + "ban @user\n" + definitions_1.Server.prefix + "ban @user1 @user2..."
};
