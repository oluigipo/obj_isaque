// NÃO RODE

let _globalBingo = -1;
function _bingo(msg, args) {
    if (globalBingo != -1) {
        if (globalBingo.check()) {
            clearInterval(globalBingo.loop);
            // código de vitória
            msg.reply("você ganhou!!!");
        } else {
            msg.channel.send("você não ganhou :(");
        }
    } else {
        if (!isAdmin(msg.author)) return;
        if (args.length < 3) {
            return msg.channel.send("tu ta usando o comando errado :<");
        }
        globalBingo = new Bingo(msg, args[1], args[2]);
        globalBingo.startStep();
    }
}

class _Bingo {
    constructor(msg, time, size) {
        this.generated_nums = [];
        this.emoji = '✅';
        this.msg = msg;
        this.time = time;
        this.size = size;
        this.filter = (reaction, user) => reaction.emoji.name === this.emoji && Banco.isRegistered(user.id);
        this.max = 100;
        this.init();
    }

    init() {
        this.msg.react(this.emoji);
        let users = [];
        this.msg.awaitReactions(this.filter, { time: this.time }).then(collected => {
            collected.forEach(reaction => {
                reaction.users.forEach(user => { this.msg.client.user.id !== user.id ? users.push(user) : null });
            });
            this.entries = this.genEntries(users);
            this.sendDms();
        }).catch(console.error);
    }

    sendDms() {
        this.entries.forEach(e => {
            e.user.createDM().then(dm => {
                dm.send(`${this.genEntryMessage(e.entry)}`).then(() => dm.delete());
            }).catch(console.error);
        });
    }

    genEntryMessage(entry) {
        let msg = "";
        for (let row = 0; row < this.size; row++) {
            for (let column = 0; column < this.size; column++) {
                msg += entry[row][column];
                msg += " ";
            }
            msg += "\n";
        }
        return msg;
    }

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
        for (let row = 0; row < this.size; row++) {
            entry.push([]);
            for (let column = 0; column < this.size; column++) {
                entry[row][column] = this.genNewNumber();
            }
        }
        return entry;
    }

    startStep() {
        this.loop = setInterval(() => {
            this.step();
        }, 5000);
    }

    step() {
        let new_number = this.genNewNumber();
        while (true) {
            let x = 0;
            this.generated_nums.forEach(el => {
                (new_number == el) ? x++ : null;
            });
            if (x == 0) {
                this.generated_nums.push(new_number);
                break;
            }
            new_number = this.genNewNumber();
        }
        this.msg.channel.send(`O próximo número é: ${new_number}`);
    }

    check(id) {
        let toReturn = false;
        this.entries.forEach(e => {
            if (e.user.id == id) {
                let line = 0;
                for (let row = 0; row < this.size; row++) {
                    for (let column = 0; column < this.size; column++) {
                        this.generated_nums.forEach(n => {
                            if (e.entry[row][column] == n) {
                                line += 1;
                            }
                        });
                        if (line == this.size) {
                            toReturn = true;
                        }
                    }
                    line = 0;
                }
            }
        });
        return toReturn;
    }

    genNewNumber() {
        return Math.trunc(this.max * Math.random()) + 1;
    }
}