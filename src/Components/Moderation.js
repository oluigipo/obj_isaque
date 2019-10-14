import discordServer from '../constants';
import fs from 'fs';

const admins = ["373670846792990720", "330403904992837632", "412797158622756864", "457020706857943051", "290130764853411840", "141958545397645312"];
const roleMuted = "568171976556937226";
const muteJSON = "./data/mutes.json";

const maxMuteTime = 60 * 60 * 24 * 7 * 2;
const aMinute = 1000 * 60;

export default class Moderation {
    /* VERIFICAÇÃO DE ADM */
    isAdmin(_user) {
        return admins.indexOf(_user.id) !== -1;
    }

    /* UNMUTE AUTOMÁTICA */
    autoUnmute(client) {
        let raw = fs.readFileSync(muteJSON, 'utf8');
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
                    member.removeRole(roleMuted);

                json.mutes = json.mutes.filter((a, ind) => ind !== i);
                continue;
            }

            ++i;
        }

        const _m = JSON.stringify(json);
        fs.writeFileSync(muteJSON, _m);
        delete json;

        setTimeout(autoUnmute, aMinute, client);
    }

    /* MUTE */
    mute(msg, args) {
        if (!isAdmin(msg.author)) return;

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
                case 'm': duration *= 60; break;
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
            if (m.roles.some(a => a.id === roleMuted)) {
                msg.channel.send(`O usuário ${m.user.tag} já está mutado.`).catch(console.error);
                return;
            }
            if (m.manageable) {
                m.addRole(roleMuted);
                if (duration > 0) {
                    //setTimeout(() => m.removeRole(roleMuted), duration * 1000);

                    const raw = fs.readFileSync(muteJSON, 'utf8');
                    let json = JSON.parse(raw);
                    json.mutes.push({ userid: m.id, duration: duration * 1000, time: Date.now() });
                    fs.writeFileSync(muteJSON, JSON.stringify(json));
                    delete json;

                    msg.channel.send(`O usuário ${m.user.tag} foi mutado por ${_formateTime(_t, _d)} com sucesso.`).catch(console.error);
                } else {
                    msg.channel.send(`O usuário ${m.user.tag} foi mutado com sucesso.`).catch(console.error);
                }
            } else {
                msg.channel.send(`Não é possível mutar o usuário ${m.user.tag}.`).catch(console.error);
            }
        });

        function _formateTime(_time, _str) {
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
    }

    /* UNMUTE */
    unmute(msg, args) {
        if (!isAdmin(msg.author)) return;
        if (args.length < 2) {
            msg.channel.send(`Uso correto: \`${discordServer.prefix}unmute @user...\``);
            return;
        }

        let raw = fs.readFileSync(muteJSON, 'utf8');
        let json = JSON.parse(raw);

        msg.mentions.members.forEach(m => {
            if (m.roles.some(a => a.id === roleMuted)) {
                for (let i = 0; i < json.mutes.length; i++) {
                    if (json.mutes[i].userid === m.id) {
                        json.mutes = json.mutes.filter((a, ind) => ind !== i);

                        fs.writeFileSync(muteJSON, JSON.stringify(json));
                        break;
                    }
                }
                m.removeRole(roleMuted);
                msg.channel.send(`O usuário ${m.user.tag} foi desmutado com sucesso.`);
            }
        });
        delete json;
    }

    /* KICK */
    kick(msg, args) {
        if (!isAdmin(msg.author)) return;
        if (args.length < 2) {
            msg.channel.send(`Uso correto: \`${discordServer.prefix}kick @user...\``);
            return;
        }

        msg.mentions.members.forEach(m => {
            if (m.kickable) {
                m.kick();
                msg.channel.send(`O usuário ${m.user.tag} foi kickado.`).catch(console.error);
            } else {
                msg.channel.send(`Não é possível kickar o usuário ${m.user.tag}.`).catch(console.error);
            }
        });
    }

    /* BAN */
    ban(msg, args) {
        if (!isAdmin(msg.author)) return;
        if (args.length < 2) {
            msg.channel.send(`Uso correto: \`${discordServer.prefix}ban @user...\``);
            return;
        }

        msg.mentions.members.forEach(m => {
            if (m.bannable) {
                m.ban();
                msg.channel.send(`O usuário ${m.user.tag} foi banido.`).catch(console.error);
            } else {
                msg.channel.send(`Não é possível banir o usuário ${m.user.tag}.`).catch(console.error);
            }
        });
    }

    /* EVAL */
    eval_(msg, args) {
        if (!(msg.author.id === "373670846792990720" || msg.author.id === "330403904992837632")) return;
        if (args.length < 2) {
            msg.channel.send(`${msg.author} Sintaxe incorreta.`);
            return;
        }

        const cmd = args.slice(1, args.length).join(' ');
        let result;
        try {
            result = eval(cmd);
        } catch (e) {
            result = e;
        }
        msg.channel.send(String(result));
    }
}
