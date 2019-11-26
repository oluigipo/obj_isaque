"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
var Moderation_1 = __importDefault(require("../../Moderation"));
exports.default = {
    run: function (msg, args) {
        if (args.length < 2 || msg.mentions.members.array().length === 0) {
            msg.channel.send(definitions_1.CommonMessages.syntaxError);
            return;
        }
        var duration = -1;
        var _t;
        var _d;
        if (args.length > 2 && args[1][0] !== '<') {
            _t = parseInt(args[1]);
            _d = args[1][String(_t).length];
            duration = 1;
            switch (_d) {
                case 'w': duration *= 7;
                case 'd': duration *= 24;
                case 'h': duration *= 60;
                case 'm':
                    duration *= 60;
                    break;
                default:
                    msg.channel.send(_t + _d + " isn't a valid time");
                    return;
            }
            duration *= _t;
            // Sem mais limite de mute!
            // if (duration > maxMuteTime) {
            //     msg.channel.send(`Tempo máximo para mute: 2w (2 semanas)`);
            //     return;
            // }
        }
        msg.mentions.members.forEach(function (m) {
            if (Moderation_1.default.isMuted(m.user.id)) {
                msg.channel.send("O usu\u00E1rio " + m.user.tag + " j\u00E1 est\u00E1 mutado.").catch(console.error);
                return;
            }
            var result = Moderation_1.default.mute(msg.client, m.user.id, duration > 0 ? duration : undefined);
            if (result) {
                if (duration > 0) {
                    msg.channel.send("O usu\u00E1rio " + m.user.tag + " foi mutado por " + _formateTime(_t, _d) + " com sucesso.").catch(console.error);
                }
                else {
                    msg.channel.send("O usu\u00E1rio " + m.user.tag + " foi mutado com sucesso.").catch(console.error);
                }
            }
            else {
                msg.channel.send("N\u00E3o foi poss\u00EDvel mutar o usu\u00E1rio " + m.user.tag + ".").catch(console.error);
            }
        });
        function _formateTime(_time, _str) {
            var s = _time + " ";
            switch (_str) {
                case 'w':
                    s += "semana";
                    break;
                case 'd':
                    s += "dia";
                    break;
                case 'h':
                    s += "hora";
                    break;
                case 'm':
                    s += "minuto";
                    break;
            }
            if (_time > 1)
                s += 's';
            return s;
        }
    },
    aliases: ["mute"],
    longHelp: "Muta um ou mais usuários no servidor por um tempo in/determinado",
    shortHelp: "Mutar usuários",
    example: definitions_1.Server.prefix + "mute @user\n" + definitions_1.Server.prefix + "mute 30m @user\n" + definitions_1.Server.prefix + "mute @user1 @user2...\n" + definitions_1.Server.prefix + "mute 1h @user1 @user2...",
    staff: true
};
