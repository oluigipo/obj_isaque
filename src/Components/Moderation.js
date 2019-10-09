const roleMuted = "568171976556937226";

function isAdmin(_user) {
    return admins.indexOf(_user.id) !== -1;
}

function mute (msg, args) {
    if (!isAdmin(msg.author)) return;
    if (args.length < 2) {
        msg.channel.send(`Uso correto: \`\`\`\n${prefix}mute @user\n${prefix}mute 30m @user\n${prefix}mute @user1 @user2...\n${prefix}mute 1h @user1 @user2...\n\`\`\``);
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
function unmute (msg, args) {
    if (!isAdmin(msg.author)) return;
    if (args.length < 2) {
        msg.channel.send(`Uso correto: \`${prefix}unmute @user...\``);
        return;
    }

    msg.mentions.members.forEach(m => {
        if (m.roles.some(a => a.id === roleMuted)) {
            m.removeRole(roleMuted);
            msg.channel.send(`O usuário ${m.user.tag} foi desmutado com sucesso.`);
        }
    });
}

module.exports = {
    mute,
    unmute,
}