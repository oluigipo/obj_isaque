"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var definitions_1 = require("./../definitions");
exports.messagesPerMoney = 100;
exports.MoneyGet = {
    mendigar: 100,
    messages: 100,
    semanal: 100
};
exports.Bank = {
    json: {},
    jsonIsOpen: false,
    jsonOpen: function () {
        var raw = fs_1.default.readFileSync(definitions_1.Files.cassino, 'utf8');
        this.json = JSON.parse(raw);
        this.jsonIsOpen = true;
    },
    jsonClose: function () {
        var text = JSON.stringify(this.json);
        fs_1.default.writeFileSync(definitions_1.Files.cassino, text);
        this.json = {};
        this.jsonIsOpen = false;
    },
    isRegistered: function (userid) {
        this.jsonOpen();
        var result = this.json.users.some(function (a) { return a.userid === userid; });
        this.jsonClose();
        return result;
    },
    register: function (userid) {
        this.jsonOpen();
        if (this.json.users.some(function (a) { return a.userid === userid; })) {
            this.jsonClose();
            return false;
        }
        this.json.users.push({ userid: userid, money: 100, messages: 0, last: 0, mendigagem: 0, medalha: 0, lastMedalha: 0 });
        this.jsonClose();
        return true;
    },
    /**
     * @returns {number} Retorna 0 se o usuário não estiver registrado, um número menor que 0 cujo será o tempo que falta para poder resgatar de novo se ele ainda não poder resgatar seu prêmio semanal e um número maior que 0 cujo será o valor ganho pelo usuário.
     * @param {string} userid ID do usuário
     */
    weekMoney: function (userid) {
        this.jsonOpen();
        var user = this.json.users.findIndex(function (a) { return a.userid === userid; });
        if (user === -1) {
            this.jsonClose();
            return 0;
        }
        if (this.json.users[user].last + definitions_1.Time.week <= Date.now()) {
            this.json.users[user].money += exports.MoneyGet.semanal;
            this.json.users[user].last = Date.now();
            this.jsonClose();
            return exports.MoneyGet.semanal;
        }
        else {
            var falta = -Math.abs(definitions_1.Time.week - (Date.now() - this.json.users[user].last));
            this.jsonClose();
            return falta;
        }
    },
    /**
     * @returns {number} Retorna -1 se o usuário não está registrado, 0 se ele não recebeu nada e um número maior que 0 se ele recebeu algo.
     * @param {string} userid Id do usuário
     */
    userMessage: function (userid) {
        this.jsonOpen();
        var user = this.json.users.findIndex(function (a) { return a.userid === userid; });
        if (user === -1) {
            this.jsonClose();
            return -1;
        }
        this.json.users[user].messages++;
        if (this.json.users[user].messages >= exports.messagesPerMoney) {
            this.json.users[user].messages -= exports.messagesPerMoney;
            this.json.users[user].money += exports.MoneyGet.messages;
            this.jsonClose();
            return exports.MoneyGet.messages;
        }
        else {
            this.jsonClose();
            return 0;
        }
    },
    /**
     * @returns {boolean} Retorna false se o usuário for inválido ou se o usuário não estiver registrado. True se o dinheiro for descontado com sucesso.
     * @param {string} userid ID do usuário.
     * @param {number} qnt Quantidade de dinheiro para ser descontada.
     */
    userPunish: function (userid, qnt) {
        this.jsonOpen();
        var user = this.json.users.findIndex(function (a) { return a.userid === userid; });
        if (user === -1) {
            this.jsonClose();
            return false;
        }
        this.json.users[user].money = Math.max(this.json.users[user].money - qnt, 0);
        this.jsonClose();
        return true;
    },
    /**
     * @returns {number} Dinheiro do usuário. -1 se o usuário não estiver registrado.
     * @param {string} userid ID do usuário
     */
    saldo: function (userid) {
        this.jsonOpen();
        var user = this.json.users.findIndex(function (a) { return a.userid === userid; });
        if (user === -1) {
            this.jsonClose();
            return -1;
        }
        var qnt = this.json.users[user].money;
        this.jsonClose();
        return qnt;
    },
    /**
     * @returns {number} 1 se a transação for bem sucedida, 0 se houver uma falha na transação, -1 se o primeiro usuário não estiver registrado e -2 se o segundo usuário não estiver registrado.
     * @param {string} userid1 ID do usuário que irá enviar o dinheiro.
     * @param {string} userid2 ID do usuário que irá receber o dinheiro.
     * @param {number} qnt Quantidade de dinheiro que deverá ser enviado.
     */
    transfer: function (userid1, userid2, qnt) {
        this.jsonOpen();
        var u1 = this.json.users.findIndex(function (a) { return a.userid === userid1; });
        if (u1 === null || u1 === undefined) {
            this.jsonClose();
            return -1;
        }
        var u2 = this.json.users.findIndex(function (a) { return a.userid === userid2; });
        if (u2 === null || u2 === undefined) {
            this.jsonClose();
            return -2;
        }
        if (this.json.users[u1].money < qnt) {
            this.jsonClose();
            return 0;
        }
        this.json.users[u1].money -= qnt;
        this.json.users[u2].money += qnt;
        this.jsonClose();
        return 1;
    },
    /**
     * @returns {number} -1 se o usuário não estiver registrado ou for inválido. Um inteiro maior que 0 se o usuário existir.
     * @param {string} userid ID do usuário
     */
    messages: function (userid) {
        this.jsonOpen();
        var user = this.json.users.findIndex(function (a) { return a.userid === userid; });
        if (user === null) {
            this.jsonClose();
            return -1;
        }
        var msgs = this.json.users[user].messages;
        this.jsonClose();
        return msgs;
    },
    /**
     * @returns {boolean} True se o dinheiro foi somado e False se o usuário não estiver registrado.
     * @param {string} userid ID do usuário que receberá o dinheiro.
     * @param {number} qnt Quantidade de dinheiro que será dada ao usuário.
     */
    giveMoney: function (userid, qnt) {
        this.jsonOpen();
        var user = this.json.users.findIndex(function (a) { return a.userid === userid; });
        if (user === -1) {
            this.jsonClose();
            return false;
        }
        this.json.users[user].money += qnt;
        this.jsonClose();
        return true;
    },
    /**
     * @returns {number | null} Retorna null se o usuário não está registrado, um número menor que 0 se ele ainda não pode mendigar de novo, 0 se ele não ganhou nada e um número maior que 0 se o usuário ganhou algo.
     * @param {string} userid ID do usuário
     */
    mendigar: function (userid) {
        this.jsonOpen();
        var user = this.json.users.findIndex(function (a) { return a.userid === userid; });
        if (user === -1) {
            this.jsonClose();
            return null;
        }
        if (this.json.users[user].mendigagem + definitions_1.Time.day > Date.now()) {
            var falta = -Math.abs(definitions_1.Time.day - (Date.now() - this.json.users[user].mendigagem));
            this.jsonClose();
            return falta;
        }
        this.json.users[user].mendigagem = Date.now();
        if (Math.random() < 0.5) {
            var m = Math.trunc((Math.random()) * 81 + 20);
            this.json.users[user].money += m;
            this.jsonClose();
            return m;
        }
        else {
            this.jsonClose();
            return 0;
        }
    },
    /**
     * @returns {number} Retorna -1 se o usuário não estiver registrado e -2 caso o usuário não tenha dinheiro o suficiente. Caso contrário retornará 0.
     * @param {string} userid ID do usuário.
     * @param {number} cost Custo da corrida.
     */
    horseraceJoin: function (userid, cost) {
        this.jsonOpen();
        var user = this.json.users.findIndex(function (a) { return a.userid === userid; });
        if (user === -1) {
            this.jsonClose();
            return -1;
        }
        if (this.json.users[user].money < cost) {
            this.jsonClose();
            return -2;
        }
        this.json.users[user].money -= cost;
        this.jsonClose();
        return 0;
    },
    userinfo: function (userid) {
        this.jsonOpen();
        var user = this.json.users.find(function (a) { return a.userid === userid; });
        this.jsonClose();
        return user;
    }
};
