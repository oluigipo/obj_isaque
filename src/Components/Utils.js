const discordServer = require('../constants');
const { shitpostChannel, cursoLink, youtubeLink } = discordServer;

const playlists = [
    { name: "primeiro jogo", link: "https://www.youtube.com/watch?v=lak9iTwvN8Q&list=PLKTRv0drNjJ-6bglGqfgBe7YlCstCa2wx" },
    { name: "rpg", link: "https://www.youtube.com/watch?v=WvbqpY9CsR8&list=PLKTRv0drNjJ8zkzW9IeJknzDi6E5kjlwL" },
    { name: "plataforma", link: "https://www.youtube.com/watch?v=dWKQQfM5l0I&list=PLKTRv0drNjJ_hnDslZnr2N8MXoe1r37N8" },
    { name: "dialogo", link: "https://www.youtube.com/watch?v=hd0M6FhX2XQ&list=PLKTRv0drNjJ_wQAPjzYOp2aaCq11XELHh" },
    { name: "animacao", link: "https://www.youtube.com/watch?v=dIQ_SIXzpzk&list=PLKTRv0drNjJ8KpDQcJu1kKHG8igpb6hjn" },
    { name: "tiro", link: "https://www.youtube.com/watch?v=TOX9goFTqes&list=PLKTRv0drNjJ_aA8ft5-y8Ok2wJfY4n4vj" },
];

async function ping(msg) {
    if (msg.channel.name !== shitpostChannel) return;
    const m = await msg.channel.send("...");
    m.edit(`\`Bot Latency:\` ${m.createdTimestamp - msg.createdTimestamp}ms\n\`API Latency:\` ${Math.round(msg.client.ping)}ms`);
}

function curso(msg) {
    msg.channel.send(`${msg.author} Aqui está o link do curso: ${cursoLink}`);
}

function nonetube(msg, args) {
    const playlistName = args[1];

    if (typeof (playlistName) === "undefined") {
        msg.channel.send(`${msg.author} Aqui está o link do youtube: ${youtubeLink}`);
        return;
    }

    playlists.forEach((list) => {
        if (list.name === playlistName) {
            msg.channel.send(`${msg.author} Aqui está o link do youtube: ${list.link}`);
            return;
        }
    });

    msg.channel.send(`${msg.author} Aqui está o link do youtube: ${youtubeLink}`);
    return;
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