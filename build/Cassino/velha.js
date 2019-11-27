"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var definitions_1 = require("../definitions");
var Spot;
(function (Spot) {
    Spot[Spot["X"] = 0] = "X";
    Spot[Spot["O"] = 1] = "O";
    Spot[Spot["FREE"] = 2] = "FREE";
})(Spot || (Spot = {}));
var Velha = /** @class */ (function () {
    function Velha() {
    }
    Object.defineProperty(Velha, "winningCombinations", {
        get: function () {
            return [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        },
        enumerable: true,
        configurable: true
    });
    Velha.checkRequests = function () {
        var _this = this;
        var now = Date.now();
        if (this.requests === undefined)
            this.requests = [];
        var _loop_1 = function (i) {
            if (this_1.requests[i].date + this_1.maxRequestTime > now) {
                this_1.requests = this_1.requests.filter(function (a) { return a !== _this.requests[i]; });
                return out_i_1 = i, "continue";
            }
            ++i;
            out_i_1 = i;
        };
        var this_1 = this, out_i_1;
        for (var i = 0; i < this.requests.length;) {
            _loop_1(i);
            i = out_i_1;
        }
        if (this.requests.length > 0) {
            setTimeout(this.checkRequests, definitions_1.Time.second);
        }
        else {
            this.timerRunning = false;
        }
    };
    Velha.makeRequest = function (p1, p2, price) {
        if (this.requests.some(function (r) { return r.players.some(function (p) { return p === p1 || p === p2; }); }) || !index_1.Bank.isRegistered(p1) || !index_1.Bank.isRegistered(p2)
            || index_1.Bank.saldo(p1) < price || index_1.Bank.saldo(p2) < price)
            return false;
        this.requests.push({ players: [p1, p2], date: Date.now(), price: price });
        if (!this.timerRunning) {
            setTimeout(this.checkRequests, definitions_1.Time.second);
        }
        this.timerRunning = true;
        return true;
    };
    Velha.acceptRequest = function (p) {
        var _this = this;
        var _loop_2 = function (i) {
            if (this_2.requests[i].players[1] === p) {
                var j = this_2.running.push({ table: this_2.makeTable(), players: this_2.requests[i].players, time: Math.floor(Math.random() * Spot.FREE), price: this_2.requests[i].price });
                this_2.requests = this_2.requests.filter(function (a) { return a !== _this.requests[i]; });
                return { value: true };
            }
        };
        var this_2 = this;
        for (var i = 0; i < this.requests.length; i++) {
            var state_1 = _loop_2(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return false;
    };
    Velha.makePlay = function (p, r) {
        var _loop_3 = function (i) {
            var run = this_3.running[i];
            if (run.players[run.time] === p) {
                if (run.table[r] !== Spot.FREE) {
                    return { value: 0 };
                }
                run.table[r] = run.time;
                var win = this_3.checkResult(run.table, run.time);
                if (win !== 0) {
                    var p_1 = (win === -1 ? -1 : run.players[run.time]);
                    if (p_1 !== -1) {
                        index_1.Bank.transfer(run.players[__aa(run.time)], p_1, run.price);
                    }
                    var toR = { w: run.table, p: p_1 };
                    this_3.running = this_3.running.filter(function (aa) { return aa !== run; });
                    return { value: toR };
                }
                run.time = __aa(run.time);
                return { value: run.table };
            }
        };
        var this_3 = this;
        for (var i = 0; i < this.running.length; i++) {
            var state_2 = _loop_3(i);
            if (typeof state_2 === "object")
                return state_2.value;
        }
        return -1;
        function __aa(s) {
            return s === Spot.X ? Spot.O : Spot.X;
        }
    };
    Velha.checkResult = function (t, s) {
        for (var i = 0; i < this.winningCombinations.length; i++) {
            var check = 0;
            for (var j = 0; j < this.winningCombinations[i].length; j++) {
                if (t[this.winningCombinations[i][j]] === s)
                    ++check;
            }
            if (check === 3) {
                return 1;
            }
        }
        if (t.filter(function (tt) { return tt === Spot.FREE; }).length === 0) {
            return -1;
        }
        return 0;
    };
    Velha.cancelMatch = function (p) {
        var _this = this;
        var _loop_4 = function (i) {
            if (this_4.requests[i].players.includes(p)) {
                this_4.requests = this_4.requests.filter(function (rr) { return rr !== _this.requests[i]; });
                return { value: 1 };
            }
        };
        var this_4 = this;
        for (var i = 0; i < this.requests.length; i++) {
            var state_3 = _loop_4(i);
            if (typeof state_3 === "object")
                return state_3.value;
        }
        var _loop_5 = function (i) {
            if (this_5.running[i].players.includes(p)) {
                index_1.Bank.transfer(p, this_5.running[i].players.filter(function (pp) { return pp !== p; })[0], this_5.running[i].price);
                this_5.running = this_5.running.filter(function (rr) { return rr !== _this.running[i]; });
                return { value: 0 };
            }
        };
        var this_5 = this;
        for (var i = 0; i < this.running.length; i++) {
            var state_4 = _loop_5(i);
            if (typeof state_4 === "object")
                return state_4.value;
        }
        return -1;
    };
    Velha.getTable = function (p) {
        for (var i = 0; i < this.running.length; i++) {
            if (this.running[i].players.includes(p))
                return this.running[i].table;
        }
        return -1;
    };
    Velha.makeTable = function () {
        return (new Array(9)).fill(Spot.FREE);
    };
    Velha.isPlaying = function (p) {
        return this.running.some(function (r) { return r.players.some(function (pp) { return pp === p; }); });
    };
    Velha.requests = [];
    Velha.running = [];
    Velha.playing = [];
    Velha.timerRunning = false;
    Velha.maxRequestTime = definitions_1.Time.minute;
    return Velha;
}());
exports.default = Velha;
