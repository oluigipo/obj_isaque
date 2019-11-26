"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var definitions_1 = require("../definitions");
var currentRun = false;
function CorridaDeCavalo(msg, maxUsers, timeToRun, duration, cost) {
    if (currentRun) {
        msg.channel.send(msg.author + " J\u00E1 existe uma corrida de cavalos acontecendo!");
        return;
    }
    currentRun = true;
    var filter = function (reaction, user) { return reaction.emoji.name === definitions_1.Emojis.yes && user.id !== msg.client.user.id && index_1.Bank.isRegistered(user.id); };
    var horseEmoji = definitions_1.Emojis.horse;
    var users = [];
    msg.channel.send(msg.author + " A corrida de cavalos iniciar\u00E1 em " + timeToRun + " segundos! A aposta \u00E9 de `$" + cost + "`")
        .then(function (message) {
        if (message !== message)
            return;
        message.react(definitions_1.Emojis.yes)
            .then(function () {
            var collector = message.createReactionCollector(filter, { time: timeToRun * 1000 });
            collector.on("end", function (collection) {
                collection.forEach(function (reaction) {
                    reaction.users.forEach(function (user) {
                        if (msg.client.user.id !== user.id && users.length < maxUsers) {
                            var result = index_1.Bank.horseraceJoin(user.id, cost);
                            if (result === -1) {
                                msg.channel.send(user + " Voc\u00EA n\u00E3o est\u00E1 registrado!");
                            }
                            else if (result === -2) {
                                msg.channel.send(user + " Voc\u00EA n\u00E3o tem dinheiro o suficiente para participar desta corrida!");
                            }
                            else {
                                users.push(user.id);
                            }
                        }
                    });
                });
                if (users.length < 2) {
                    msg.channel.send("Não é possível ter corrida com menos de 2 participantes!");
                    currentRun = false;
                }
                else {
                    gameRun(users, message);
                }
            });
        });
    });
    function gameRun(users, mymsg) {
        var horses = [];
        var _maxstr = String(users.length).length + 1;
        var newText = "Total acumulado: " + cost * users.length + "\nParticipantes escolhidos (Total: " + users.length + "):\n```";
        var _loop_1 = function (i) {
            horses.push({ progress: 1, owner: users[i] });
            var member = mymsg.guild.members.find(function (a) { return a.id === users[i]; });
            newText += i + 1 + (' '.repeat(_maxstr - String(i).length)) + "- " + member.user.tag + "\n";
        };
        for (var i = 0; i < users.length; i++) {
            _loop_1(i);
        }
        newText += "```";
        mymsg.edit(newText).then(function (msg) {
            msg.channel.send("...").then(function (message) { if (message === message)
                tick(message, horses); });
        });
    }
    function tick(message, horses) {
        var winner = -1;
        var newText = "Progresso da corrida:```";
        for (var i = 0; i < horses.length; i++) {
            if (Math.random() < 0.75)
                horses[i].progress++;
            newText += i + 1 + (i < 9 ? ' ' : '  ') + "- |";
            newText += ' '.repeat(duration - horses[i].progress);
            newText += "" + horseEmoji;
            newText += ' '.repeat(duration - (duration - horses[i].progress) - 1) + "|\n";
            if (horses[i].progress >= duration) {
                winner = i;
            }
        }
        var member;
        if (winner > 0) {
            member = message.guild.members.find(function (a) { return a.id === horses[winner].owner; });
            newText = "Vencedor: " + member.user + "\n" + newText;
        }
        else {
            newText = "Vencedor: (Ainda em andamento...)\n" + newText;
        }
        newText += "```";
        message.edit(newText).then(function (msg) {
            if (winner === -1)
                setTimeout(tick, definitions_1.Time.second, message, horses);
            else {
                var moneyWon = horses.length * cost;
                member = message.guild.members.find(function (a) { return a.id === horses[winner].owner; });
                index_1.Bank.giveMoney(horses[winner].owner, moneyWon);
                msg.channel.send("Parab\u00E9ns, " + member.user + "! Voc\u00EA acaba de ganhar `$" + moneyWon + "`!");
                currentRun = false;
            }
        });
    }
}
exports.default = CorridaDeCavalo;
