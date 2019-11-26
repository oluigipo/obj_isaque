"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../definitions");
var _1 = require(".");
exports.bingoCurrent = -1;
var Bingo = /** @class */ (function () {
    function Bingo(msg, timeToRun, size, prize) {
        this.cartelas = [];
        this.sorteados = [];
        this.checkWin = "";
        this.max = 60;
        this.sorteadosN = [];
        this.size = size;
        this.timeToRun = timeToRun * 1000; // TRansformar em MS, coisa que tu não fez.
        this.msg = msg;
        this.prizeval = prize;
        bingoRun(this);
    }
    /**
         * @returns {boolean}
         */
    Bingo.prototype.check = function () {
        var _this = this;
        var index = this.cartelas.findIndex(function (c) { return c.owner === _this.checkWin; });
        var confirm = this.size;
        for (var i = 0; i < this.cartelas[index].cartela.length; i++) {
            var confirm2 = this.size;
            for (var j = 0; j < this.cartelas[index].cartela.length; j++) {
                if (j === 0)
                    confirm2 = this.size;
                if (this.sorteados[this.cartelas[index].cartela[i + j * this.size]])
                    confirm2--;
                if (confirm2 === 0)
                    return true;
            }
            if (i % this.size === 0)
                confirm = this.size;
            if (this.sorteados[this.cartelas[index].cartela[i]])
                confirm--;
            if (confirm === 0)
                return true;
        }
        return false;
    };
    Bingo.setCurrent = function (b) {
        exports.bingoCurrent = b;
    };
    Bingo.prototype.prize = function () {
        return this.prizeval;
    };
    return Bingo;
}());
exports.Bingo = Bingo;
function bingoRun(b) {
    var gamemsg;
    var tickCount = 0;
    var winner = -1;
    var gameEnd = false;
    var text;
    var numberPerTick = 5;
    var tickRate = 100;
    initialize();
    // Gera as paradinhas do bingo (cartelas) e manda as msgs na dm dos users
    function initialize() {
        for (var i = 0; i < b.max; i++) {
            b.sorteados[i] = false;
        }
        var filter = function (reaction, user) { return reaction.emoji.name === definitions_1.Emojis.yes && user.id !== b.msg.client.user.id && _1.Bank.isRegistered(user.id); };
        b.msg.channel.send(b.msg.author + " O bingo iniciar\u00E1 em " + definitions_1.formatDate(b.timeToRun) + "! Pr\u00EAmio: `" + b.prizeval + "`")
            .then(function (message) {
            if (message !== message)
                return;
            message.react(definitions_1.Emojis.yes);
            var collector = message.createReactionCollector(filter, { time: b.timeToRun });
            collector.on("end", function (collection) {
                collection.forEach(function (reaction) {
                    reaction.users.forEach(function (user) {
                        if (user.id === b.msg.client.user.id)
                            return;
                        if (_1.Bank.isRegistered(user.id)) {
                            var car_1 = generateCartela();
                            b.cartelas.push({ owner: user.id, cartela: car_1 });
                            user.createDM()
                                .then(function (dm) {
                                dm.send("" + fortmatCartela(car_1)).then(function () { dm.delete(); });
                            });
                        }
                        else {
                            b.msg.channel.send(user + " Voc\u00EA n\u00E3o est\u00E1 registrado.");
                        }
                    });
                });
                start();
            });
        });
    }
    function fortmatCartela(cartela) {
        var text = "```";
        for (var i = 0; i < cartela.length; i++) {
            if (i % b.size === 0)
                text += "\n";
            text += "" + (cartela[i] + ' '.repeat(3 - String(cartela[i]).length));
        }
        text += "\n```";
        return text;
    }
    function generateCartela() {
        var cartela = [];
        var generated = [];
        var _loop_1 = function (i) {
            var gen;
            do {
                gen = Math.trunc(Math.random() * b.max + 1);
            } while (generated.some(function (a) { return a === gen; }));
            cartela.push(gen);
            generated.push(gen);
        };
        for (var i = 0; i < b.size * b.size; i++) {
            _loop_1(i);
        }
        cartela = cartela.sort(function (a, b) { return (Number)(a > b); });
        return cartela;
    }
    function start() {
        var maxSize = String(b.cartelas.length).length;
        text = "Os participantes são:```";
        var _loop_2 = function (i) {
            var member = b.msg.guild.members.find(function (a) { return a.id === b.cartelas[i].owner; });
            text += i + 1 + ' '.repeat(maxSize - String(i).length) + "- " + member.user.tag + "\n";
        };
        for (var i = 0; i < b.cartelas.length; i++) {
            _loop_2(i);
        }
        text += "```";
        b.msg.channel.send(text).then(function (message) {
            gamemsg = message;
            setTimeout(tick, tickRate);
        });
    }
    function tick() {
        var generateNumber = (tickCount === 0);
        tickCount = (tickCount + 1) % numberPerTick;
        if (b.checkWin !== "") {
            for (var i = 0; i < b.cartelas.length; i++) {
                if (b.cartelas[i].owner === b.checkWin && b.check()) {
                    gameEnd = true;
                    winner = i;
                }
            }
            b.checkWin = "";
        }
        if (generateNumber) {
            var gen = void 0;
            do {
                gen = Math.trunc(Math.random() * b.max + 1);
            } while (b.sorteados[gen]);
            b.sorteados[gen] = true;
            b.sorteadosN.push(gen);
        }
        var toEdit = text + ("```" + b.sorteadosN.join(' ') + "```");
        gamemsg.edit(toEdit).then(function () {
            if (gameEnd) {
                var member = b.msg.guild.members.find(function (a) { return a.id === b.cartelas[winner].owner; });
                _1.Bank.giveMoney(b.cartelas[winner].owner, b.prize());
                gamemsg.channel.send(member.user + " Parab\u00E9ns, voc\u00EA ganhou o bingo! Pr\u00EAmio: `$" + b.prize() + "`");
                exports.bingoCurrent = -1;
            }
            else
                setTimeout(tick, tickRate);
        });
    }
}
