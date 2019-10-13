/*
 * Este código está guardado para uso futuro.
 * Ele não funciona.
 */

function bingo(msg, args) {
    if (args.length < 2) {
        return msg.channel.send("tu ta usando o comando errado :<");
    }
    const bingo = new Bingo(msg, args[0], args[1]);
}

class Bingo {
    constructor(msg, time, size) {
        this.msg = msg;
        this.time = time;
        this.size = size;
        this.emoji = '✅';
        this.filter = (reaction, user) => reaction.emoji.name === this.emoji && Banco.isRegistered(user.id);
        this.max = 100;
        const users = this.initBingo();
        this.entries = this.genEntries(users);
        console.log(this.entries);
    }

    initBingo() {
        this.msg.react(this.emoji);
        let users = [];
        let collector = this.msg.createReactionCollector(this.filter, { time: this.time });
        collector.on("end", collected => {
            collected.forEach(reaction => {
                reaction.users.forEach(user => { this.msg.client.user.id !== user.id ? users.push(user) : null });
            });
            return users;
        });
    }

    // sendDms() {
    // 	this.entries.forEach(entry => {
    // 		let dm = entry.user.createDM().catch(console.error);
    // 		dm.send(this.genEntryMessage(entry.entry));
    // 		dm.delete();
    // 	});
    // }

    // genEntryMessage(entry) {
    // 	let msg = "";
    // 	for (let row = 0; row < this.size; i++) {
    // 		for (let column = 0; column < this.size; i++) {
    // 			entry[row][column] = Math.trunc(max * Math.random()) + 1;
    // 		}
    // 	}
    // }

    genEntries(users) {
        const entries = [];
        users.forEach(user => {
            entries.push({
                user: user, entry: this.genEntry()
            });
        });
        return entries;
    }

    genEntry() {
        let entry = [];
        for (let row = 0; row < this.size; i++) {
            for (let column = 0; column < this.size; i++) {
                entry[row][column] = Math.trunc(max * Math.random()) + 1;
            }
        }
        return entry;
    }
    // genEntry() {
    // 	let entry = "";
    // 	for (let row = 0; row < this.size; i++) {
    // 		for (let column = 0; column < this.size; i++) {
    // 			entry += Math.trunc(max * Math.random()) + 1;
    // 			entry += " ";
    // 		}
    // 		entry += "\n";
    // 	}
    // 	return entry;
    // }
}

