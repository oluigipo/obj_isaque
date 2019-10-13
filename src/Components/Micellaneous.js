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

    const e = msg.guild.emojis.find(a => a.name.toLowerCase() === args[1].toLowerCase());
    if (e === null) {
        msg.channel.send(`O emoji \`${args[1]}\` é inválido.`);
        return;
    }

    const name = msg.member.nickname;
    const image = msg.author.avatarURL;

    const wh = new WebhookClient("632682130211602432", "DqxkqXbOOK7WZXRjhFx36raoe1UuPQ55I1ZqnPD_YZR-z3ORIubZgKXnxvx5gd4ZkTw9");
    wh.channelID = msg.channel.id;
    wh.name = name;
    wh.edit(name, image).then(() => {
        wh.send(`${e}`);
        wh.destroy();
    });

    msg.delete();
}

module.exports = {
    ulon,
    emoji
}