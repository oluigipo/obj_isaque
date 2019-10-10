const discordServer = require('../constants');
const { shitpostChannel, cursoLink, youtubeLink } = discordServer;

async function ping(msg) {
    if (msg.channel.name !== shitpostChannel) return;
    const m = await msg.channel.send("...");
    m.edit(`\`Bot Latency:\` ${m.createdTimestamp - msg.createdTimestamp}ms\n\`API Latency:\` ${Math.round(msg.client.ping)}ms`);
}

function curso(msg) {
    msg.channel.send(`${msg.author} Aqui está o link do curso: ${cursoLink}`);
}

function nonetube(msg) {
    msg.channel.send(`${msg.author} Aqui está o link do youtube: ${youtubeLink}`);
}

function help(msg, args) {
    let s;
    if (args.length < 2) {
        s = discordServer.helpMessage;
    } else {
        s = discordServer.helpCommands[args[1]];
        if (s === undefined) s = "Comando desconhecido.";
    }

    msg.channel.send(`${msg.author} ${s}`);
}

module.exports = {
    ping,
    curso,
    help,
    nonetube
}
