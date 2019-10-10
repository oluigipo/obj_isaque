const discordServer = require('../constants');
const { shitpostChannel, cursoLink } = discordServer;

async function ping (msg) {
    if (msg.channel.name !== shitpostChannel) return;
    const m = await msg.channel.send("...");
    m.edit(`\`Bot Latency:\` ${m.createdTimestamp - msg.createdTimestamp}ms\n\`API Latency:\` ${Math.round(msg.client.ping)}ms`);
}

function curso (msg) {
    msg.channel.send(`${msg.author} Aqui está o link do curso: ${cursoLink}`);
}

module.exports = {
    ping,
    curso,
}