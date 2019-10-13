const { shitpostChannel, sintaxErrorMessage } = require('../constants');
const { WebhookClient } = require("discord.js");

function ulon(msg) {
    if (msg.channel.name !== shitpostChannel) return;
    const qnt = Math.floor(Math.random() * 200 + 2);
    msg.channel.send("UL" + "O".repeat(qnt) + "N")
        .catch(console.error);
}

function emoji(msg, args) {
    if (args.length < 2) {
        msg.channel.send(sintaxErrorMessage);
        return;
    }

    const e = msg.guild.emojis.find(a => a.name === args[1]);
    if (e === null || e === undefined) {
        msg.channel.send(`O emoji \`${args[1]}\` é inválido.`);
        return;
    }

    const name = msg.member.nickname === null ? msg.author.username : msg.member.nickname;
    const image = msg.author.avatarURL;

    msg.channel.createWebhook(name, image)
        .then(w => {
            w.send(`${e}`).then(() => w.delete())
        }).catch(a => msg.channel.send(a));

    msg.delete();
}

module.exports = {
    ulon,
    emoji
}