"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discordServer = __importStar(require("../constants"));
const fs_1 = __importDefault(require("fs"));
const admins = ["373670846792990720", "330403904992837632", "412797158622756864", "457020706857943051", "290130764853411840", "141958545397645312"];
const muteJSON = "./data/mutes.json";
const maxMuteTime = 60 * 60 * 24 * 7 * 2;
const aMinute = 1000 * 60;
class Moderation {
    /* VERIFICAÇÃO DE ADM */
    static isAdmin(_user) {
        return admins.indexOf(_user.id) !== -1;
    }
    /* UNMUTE AUTOMÁTICA */
    static autoUnmute(client) {
        let raw = fs_1.default.readFileSync(muteJSON, 'utf8');
        let json = JSON.parse(raw);
        const now = Date.now();
        for (let i = 0; i < json.mutes.length;) {
            const userid = json.mutes[i].userid;
            const duration = json.mutes[i].duration;
            const time = json.mutes[i].time;
            if (now > time + duration) {
                const guild = client.guilds.get(discordServer.serverID);
                const member = guild.members.find(a => a.id === userid);
                if (member)
                    member.removeRole(Moderation.roleMuted);
                json.mutes = json.mutes.filter((a, ind) => ind !== i);
                continue;
            }
            ++i;
        }
        const _m = JSON.stringify(json);
        fs_1.default.writeFileSync(muteJSON, _m);
        setTimeout(Moderation.autoUnmute, aMinute, client);
    }
    static isMuted(userid) {
        let raw = fs_1.default.readFileSync(muteJSON, 'utf8');
        let json = JSON.parse(raw);
        return json.mutes.findIndex((user) => user.userid === userid) !== -1;
    }
    /* MUTE */
    mute(msg, args) {
        if (!Moderation.isAdmin(msg.author))
            return;
        if (args.length < 2 || msg.mentions.members.array().length === 0) {
            msg.channel.send(discordServer.sintaxErrorMessage);
            return;
        }
        let duration = -1;
        let _t;
        let _d;
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
                    msg.channel.send(`${_t + _d} isn't a valid time`);
                    return;
            }
            duration *= _t;
            if (duration > maxMuteTime) {
                msg.channel.send(`Tempo máximo para mute: 2w (2 semanas)`);
                return;
            }
        }
        msg.mentions.members.forEach(m => {
            if (m.roles.some(a => a.id === Moderation.roleMuted)) {
                msg.channel.send(`O usuário ${m.user.tag} já está mutado.`).catch(console.error);
                return;
            }
            if (m.manageable) {
                m.addRole(Moderation.roleMuted);
                if (duration > 0) {
                    //setTimeout(() => m.removeRole(roleMuted), duration * 1000);
                    const raw = fs_1.default.readFileSync(muteJSON, 'utf8');
                    let json = JSON.parse(raw);
                    json.mutes.push({ userid: m.id, duration: duration * 1000, time: Date.now() });
                    fs_1.default.writeFileSync(muteJSON, JSON.stringify(json));
                    msg.channel.send(`O usuário ${m.user.tag} foi mutado por ${_formateTime(_t, _d)} com sucesso.`).catch(console.error);
                }
                else {
                    msg.channel.send(`O usuário ${m.user.tag} foi mutado com sucesso.`).catch(console.error);
                }
            }
            else {
                msg.channel.send(`Não é possível mutar o usuário ${m.user.tag}.`).catch(console.error);
            }
        });
        function _formateTime(_time, _str) {
            let s = `${_time} `;
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
    }
    /* UNMUTE */
    unmute(msg, args) {
        if (!Moderation.isAdmin(msg.author))
            return;
        if (args.length < 2) {
            msg.channel.send(`Uso correto: \`${discordServer.prefix}unmute @user...\``);
            return;
        }
        let raw = fs_1.default.readFileSync(muteJSON, 'utf8');
        let json = JSON.parse(raw);
        msg.mentions.members.forEach(m => {
            if (m.roles.some(a => a.id === Moderation.roleMuted)) {
                for (let i = 0; i < json.mutes.length; i++) {
                    if (json.mutes[i].userid === m.id) {
                        json.mutes = json.mutes.filter((a, ind) => ind !== i);
                        fs_1.default.writeFileSync(muteJSON, JSON.stringify(json));
                        break;
                    }
                }
                m.removeRole(Moderation.roleMuted);
                msg.channel.send(`O usuário ${m.user.tag} foi desmutado com sucesso.`);
            }
        });
    }
    /* KICK */
    kick(msg, args) {
        if (!Moderation.isAdmin(msg.author))
            return;
        if (args.length < 2) {
            msg.channel.send(`Uso correto: \`${discordServer.prefix}kick @user...\``);
            return;
        }
        msg.mentions.members.forEach(m => {
            if (m.kickable) {
                m.kick();
                msg.channel.send(`O usuário ${m.user.tag} foi kickado.`).catch(console.error);
            }
            else {
                msg.channel.send(`Não é possível kickar o usuário ${m.user.tag}.`).catch(console.error);
            }
        });
    }
    /* BAN */
    ban(msg, args) {
        if (!Moderation.isAdmin(msg.author))
            return;
        if (args.length < 2) {
            msg.channel.send(`Uso correto: \`${discordServer.prefix}ban @user...\``);
            return;
        }
        msg.mentions.members.forEach(m => {
            if (m.bannable) {
                m.ban();
                msg.channel.send(`O usuário ${m.user.tag} foi banido.`).catch(console.error);
            }
            else {
                msg.channel.send(`Não é possível banir o usuário ${m.user.tag}.`).catch(console.error);
            }
        });
    }
}
exports.default = Moderation;
Moderation.roleMuted = "568171976556937226";
