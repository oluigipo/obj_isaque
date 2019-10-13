// Nada disso funciona ainda. NÃO TOQUE!

function bingo(msg, args) {
    if (args.length < 1) {
        msg.channel.send("presiso de um tempo ai po");
        return;
    }
    const time = parseInt(args[0]);
    if (!time) {
        msg.channel.send("isso não é um tempo porrar");
        return;
    }
    const users = init_bingo(msg, time);
    if (args.length < 2) {
        msg.channel.send("presiso do tamanho da cartela po");
        return;
    }
    const entries = genEntries(users, 5);
    console.log(entries);
}


const emoji = '✅';

const filter = (reaction, user) => reaction.emoji.name === emoji && Banco.isRegistered();

function init_bingo(msg, time) {
    msg.react(emoji);
    let users = [];
    let collector = msg.awaitReactions(filter, { time: time })
    collector.on("end", collected => {
        collected.forEach(reaction => {
            reaction.users.forEach(user => { msg.client.user.id !== user.id ? users.push(user.id) : null });
        });
        return users;
    });
}

function genEntries(users, size) {
    const entries = [];
    users.forEach(user => {
        entries.push({ id: user, genEntry(size) });
    });
    return entries;
}

const max = 100;

function genEntry(size) {
    let entry = "";
    for (let row = 0; i < size; i++) {
        for (let column = 0; i < size; i++) {
            entry += Math.trunc(max * Math.random()) + 1;
            entry += " ";
        }
        entry += "\n";
    }
    return entry;
}