import { Command, Arguments, CommonMessages, Roles, Server } from "../../definitions";
import Moderation from "../../Moderation";
import { Message } from "discord.js";

export default <Command>{
    run: (msg: Message, args: Arguments) => {
        if (args.length < 2 || msg.mentions.members.array().length === 0) {
            msg.channel.send(CommonMessages.syntaxError);
            return;
        }

        let duration = -1;
        let _t: number;
        let _d: string;
        if (args.length > 2 && args[1][0] !== '<') {
            _t = parseInt(args[1]);
            _d = args[1][String(_t).length];

            duration = 1;
            switch (_d) {
                case 'w': duration *= 7;
                case 'd': duration *= 24;
                case 'h': duration *= 60;
                case 'm': duration *= 60; break;
                default:
                    msg.channel.send(`${_t + _d} não é uma duração válida`);
                    return;
            }

            duration *= _t;
            duration *= 1000;

            // Sem mais limite de mute!
            // if (duration > maxMuteTime) {
            //     msg.channel.send(`Tempo máximo para mute: 2w (2 semanas)`);
            //     return;
            // }
        }

        msg.mentions.members.forEach(m => {
            if (Moderation.isMuted(m.user.id)) {
                msg.channel.send(`O usuário ${m.user.tag} já está mutado.`).catch(console.error);
                return;
            }
            let result = Moderation.mute(msg.client, m.user.id, duration > 0 ? duration : undefined);
            if (result) {
                if (duration > 0) {
                    msg.channel.send(`O usuário ${m.user.tag} foi mutado por ${_formateTime(_t, _d)} com sucesso.`).catch(console.error);
                } else {
                    msg.channel.send(`O usuário ${m.user.tag} foi mutado com sucesso.`).catch(console.error);
                }
            } else {
                msg.channel.send(`Não foi possível mutar o usuário ${m.user.tag}.`).catch(console.error);
            }
        });

        function _formateTime(_time: number, _str: string) {
            let s = `${_time} `;
            switch (_str) {
                case 'w': s += "semana"; break;
                case 'd': s += "dia"; break;
                case 'h': s += "hora"; break;
                case 'm': s += "minuto"; break;
            }
            if (_time > 1) s += 's';

            return s;
        }
    },
    aliases: ["mute"],
    longHelp: "Muta um ou mais usuários no servidor por um tempo in/determinado",
    shortHelp: "Mutar usuários",
    example: `${Server.prefix}mute @user\n${Server.prefix}mute 30m @user\n${Server.prefix}mute @user1 @user2...\n${Server.prefix}mute 1h @user1 @user2...`,
    staff: true
};