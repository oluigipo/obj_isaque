"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
exports.currentLoteria = -1;
var Loteria = /** @class */ (function () {
    function Loteria(custo) {
        this.participantes = [];
        this.custo = custo;
    }
    Loteria.setCurrent = function (a) {
        exports.currentLoteria = a;
    };
    /**
     * @returns {number} Retorna -1 se o usuário já tiver comprado algum bilhete, caso contrário retorna a quantidade de bilhetes compradas
     * @param {string} user
     * @param {number} qnt
     */
    Loteria.prototype.bilhete = function (user, qnt) {
        if (this.participantes.some(function (a) { return a === user; }))
            return -1;
        index_1.Bank.jsonOpen();
        var userindex = index_1.Bank.json.users.findIndex(function (a) { return a.userid === user; });
        var i;
        for (i = 0; i < qnt; i++) {
            if (index_1.Bank.json.users[userindex].money < this.custo)
                break;
            this.participantes.push(user);
            index_1.Bank.json.users[userindex].money -= this.custo;
        }
        index_1.Bank.jsonClose();
        return i;
    };
    /**
     * @returns {number} A quantidade de dinheiro já acumulada.
     */
    Loteria.prototype.pot = function () {
        return this.participantes.length * this.custo;
    };
    /**
     * @returns {object | undefined} Retorna o ID do usuário vencedor e a quantidade de dinheiro obtida. {user: string, money: number}
     */
    Loteria.prototype.resultado = function () {
        var _this = this;
        if (this.participantes.length === 0)
            return undefined;
        var result = Math.min(Math.floor(Math.random() * this.participantes.length), this.participantes.length - 1);
        var moneyWon = this.participantes.length * this.custo;
        index_1.Bank.jsonOpen();
        var ind = index_1.Bank.json.users.findIndex(function (a) { return a.userid === _this.participantes[result]; });
        index_1.Bank.json.users[ind].money += moneyWon;
        var toReturn = { user: this.participantes[result], money: moneyWon };
        index_1.Bank.jsonClose();
        return toReturn;
    };
    return Loteria;
}());
exports.Loteria = Loteria;
