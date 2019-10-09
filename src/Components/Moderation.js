const roleMuted = "568171976556937226";
const admins = ["373670846792990720", "330403904992837632", "412797158622756864", "457020706857943051", "290130764853411840", "141958545397645312"];
const maxMuteTime = 60 * 60 * 24 * 7 * 2;
const discordServer = require('./../constants');

function isAdmin(_user) {
    return admins.indexOf(_user.id) !== -1;
}

function mute(msg, args) {
    if (!isAdmin(msg.author)) return;
    if (args.length < 2 || msg.mentions.members.array().length === 0) {
        msg.channel.send(`Uso correto: \`\`\`\n${discordServer.prefix}mute @user\n${discordServer.prefix}mute 30m @user\n${discordServer.prefix}mute @user1 @user2...\n${discordServer.prefix}mute 1h @user1 @user2...\n\`\`\``);
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
            case 's': break;
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
        if (m.manageable) {
            m.addRole(roleMuted);
            if (duration > 0) {
                setTimeout(() => m.removeRole(roleMuted), duration * 1000);
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
            case 's': s += "segundo"; break;
        }
        if (_time > 1) s += 's';

        return s;
    }
}
function unmute(msg, args) {
    if (!isAdmin(msg.author)) return;
    if (args.length < 2) {
        msg.channel.send(`Uso correto: \`${discordServer.prefix}unmute @user...\``);
        return;
    }

    msg.mentions.members.forEach(m => {
        if (m.roles.some(a => a.id === roleMuted)) {
            m.removeRole(roleMuted);
            msg.channel.send(`O usuário ${m.user.tag} foi desmutado com sucesso.`);
        }
    });
}

function kick(msg, args) {
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

function ban(msg, args) {
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

module.exports = {
    mute,
    unmute,
    kick,
    ban
}
