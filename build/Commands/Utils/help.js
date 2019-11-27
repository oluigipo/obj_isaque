"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var index_1 = __importDefault(require("../index"));
var Moderation_1 = __importDefault(require("../../Moderation"));
exports.default = {
    run: function (msg, args) {
        var final;
        var isAdm = Moderation_1.default.isAdmin(msg.member);
        if (args.length > 1) { // !!help comando
            var command = index_1.default.find(function (v) { return v.aliases.includes(args[1]); });
            if (command === undefined) {
                msg.channel.send(msg.author + " Este comando n\u00E3o existe.");
                return;
            }
            final = msg.author + " " + (command.staff ? "(Staff Only) " : "");
            if (command.aliases.length > 1) {
                final += "Aliases: `" + command.aliases.join(', ') + "`. ";
            }
            final += command.longHelp + ". ";
            final += "Exemplo: ```" + command.example + "```";
        }
        else { // !!help
            var size = 0;
            for (var i = 0; i < index_1.default.length; i++) {
                if (size < index_1.default[i].aliases[0].length)
                    size = index_1.default[i].aliases[0].length;
            }
            ++size;
            final = "```markdown\n";
            for (var i = 0; i < index_1.default.length; i++) {
                var cmd = index_1.default[i];
                if (cmd.staff && !isAdm)
                    continue;
                final += "< " + cmd.aliases[0] + " >" + ' '.repeat(size - cmd.aliases[0].length) + cmd.shortHelp + ".\n"; // ${cmd.staff ? " (Staff Only)" : ""}
            }
            final += "\n```";
        }
        msg.channel.send(final);
    },
    staff: false,
    aliases: ["help", "ajuda"],
    shortHelp: "Helpa aqui!",
    longHelp: "HEEEELP",
    example: definitions_1.Server.prefix + "help\n" + definitions_1.Server.prefix + "help comando"
};
