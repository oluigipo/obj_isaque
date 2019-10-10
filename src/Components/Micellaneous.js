const { shitpostChannel } = require('../constants');

function ulon (msg) {
    if (msg.channel.name !== shitpostChannel) return;
    const qnt = Math.floor(Math.random() * 200 + 2);
    msg.channel.send("UL" + "O".repeat(qnt) + "N")
        .catch(console.error);
}

module.exports = {
    ulon,
}