"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Bank_1 = __importDefault(require("../Bank"));
const discordServer = __importStar(require("../../constants"));
const Banco_1 = require("./Banco");
function isMessage(obj) {
    return obj.author != undefined;
}
function CorridaDeCavalo(msg, maxUsers, timeToRun, duration, cost) {
    Bank_1.default.corridaCurrent = true;
    const filter = (reaction, user) => reaction.emoji.name === discordServer.yesEmoji && user.id !== msg.client.user.id && Banco_1.Banco.isRegistered(user.id);
    const horseEmoji = '🏇';
    let users = [];
    msg.channel.send(`${msg.author} A corrida de cavalos iniciará em ${timeToRun} segundos! A aposta é de \`$${cost}\``)
        .then((message) => {
        if (!isMessage(message))
            return;
        message.react(discordServer.yesEmoji)
            .then(() => {
            const collector = message.createReactionCollector(filter, { time: timeToRun * 1000 });
            collector.on("end", collection => {
                collection.forEach(reaction => {
                    reaction.users.forEach(user => {
                        if (msg.client.user.id !== user.id && users.length < maxUsers) {
                            const result = Banco_1.Banco.horseraceJoin(user.id, cost);
                            if (result === -1) {
                                msg.channel.send(`${user} Você não está registrado!`);
                            }
                            else if (result === -2) {
                                msg.channel.send(`${user} Você não tem dinheiro o suficiente para participar desta corrida!`);
                            }
                            else {
                                users.push(user.id);
                            }
                        }
                    });
                });
                if (users.length < 2) {
                    msg.channel.send("Não é possível ter corrida com menos de 2 participantes!");
                    Bank_1.default.corridaCurrent = false;
                }
                else {
                    gameRun(users, message);
                }
            });
        });
    });
    function gameRun(users, mymsg) {
        let horses = [];
        let _maxstr = String(users.length).length + 1;
        let newText = `Total acumulado: ${cost * users.length}\nParticipantes escolhidos (Total: ${users.length}):\n\`\`\``;
        for (let i = 0; i < users.length; i++) {
            horses.push({ progress: 1, owner: users[i] });
            const member = mymsg.guild.members.find(a => a.id === users[i]);
            newText += `${i + 1 + (' '.repeat(_maxstr - String(i).length))}- ${member.user.tag}\n`;
        }
        newText += "```";
        mymsg.edit(newText).then(msg => {
            msg.channel.send("...").then(message => { if (isMessage(message))
                tick(message, horses); });
        });
    }
    function tick(message, horses) {
        let winner = -1;
        let newText = "Progresso da corrida:```";
        for (let i = 0; i < horses.length; i++) {
            if (Math.random() < 0.75)
                horses[i].progress++;
            newText += `${i + 1 + (i < 9 ? ' ' : '  ')}- |`;
            newText += ' '.repeat(duration - horses[i].progress);
            newText += `${horseEmoji}`;
            newText += `${' '.repeat(duration - (duration - horses[i].progress) - 1)}|\n`;
            if (horses[i].progress >= duration) {
                winner = i;
            }
        }
        let member;
        if (winner > 0) {
            member = message.guild.members.find(a => a.id === horses[winner].owner);
            newText = `Vencedor: ${member.user}\n` + newText;
        }
        else {
            newText = "Vencedor: (Ainda em andamento...)\n" + newText;
        }
        newText += "```";
        message.edit(newText).then(msg => {
            if (winner === -1)
                setTimeout(tick, discordServer.timing.second, message, horses);
            else {
                let moneyWon = horses.length * cost;
                member = message.guild.members.find(a => a.id === horses[winner].owner);
                Banco_1.Banco.giveMoney(horses[winner].owner, moneyWon);
                msg.channel.send(`Parabéns, ${member.user}! Você acaba de ganhar \`$${moneyWon}\`!`);
                Bank_1.default.corridaCurrent = false;
            }
        });
    }
}
exports.default = CorridaDeCavalo;
