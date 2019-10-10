const { shitpostChannel, sintaxErrorMessage } = require('../constants');

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
    if (e === undefined) {
        msg.channel.send(`O emoji \`${args[1]}\` é inválido.`);
        return;
    }

    msg.channel.send(`${e}`); // ${msg.author}: 
    msg.delete();
}

module.exports = {
    ulon,
    emoji
}
