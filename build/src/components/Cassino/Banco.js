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
const fs_1 = __importDefault(require("fs"));
const discordServer = __importStar(require("./../../constants"));
const userData = "./data/usersdata.json";
const moneyToWon = 100;
const messagesPerMoney = 100;
const teste = { users: [] };
exports.Banco = {
    json: teste,
    jsonOpened: false,
    jsonOpen() {
        const raw = fs_1.default.readFileSync(userData, { encoding: 'utf8' });
        this.json = JSON.parse(raw);
        this.jsonOpened = true;
    },
    jsonClose() {
        const text = JSON.stringify(this.json);
        fs_1.default.writeFileSync(userData, text);
        this.json = teste;
        this.jsonOpened = false;
    },
    isRegistered(userid) {
        this.jsonOpen();
        const result = this.json.users.some(a => a.userid === userid);
        this.jsonClose();
        return result;
    },
    register(userid) {
        this.jsonOpen();
        if (this.json.users.some(a => a.userid === userid)) {
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
    weekMoney(userid) {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);
        if (user === -1) {
            this.jsonClose();
            return 0;
        }
        if (this.json.users[user].last + discordServer.timing.week <= Date.now()) {
            this.json.users[user].money += moneyToWon;
            this.json.users[user].last = Date.now();
            this.jsonClose();
            return moneyToWon;
        }
        else {
            const falta = -Math.abs(discordServer.timing.week - (Date.now() - this.json.users[user].last));
            this.jsonClose();
            return falta;
        }
    },
    /**
     * @returns {number}
     * @param {string} userid Id do usuário
     */
    userMessage(userid) {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);
        if (user === -1) {
            this.jsonClose();
            return -1;
        }
        this.json.users[user].messages++;
        if (this.json.users[user].messages >= messagesPerMoney) {
            this.json.users[user].messages -= messagesPerMoney;
            this.json.users[user].money += moneyToWon;
            this.jsonClose();
            return moneyToWon;
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
    userPunish(userid, qnt) {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);
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
    saldo(userid) {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);
        if (user === -1) {
            this.jsonClose();
            return -1;
        }
        const qnt = this.json.users[user].money;
        this.jsonClose();
        return qnt;
    },
    /**
     * @returns {number} 1 se a transação for bem sucedida, 0 se houver uma falha na transação, -1 se o primeiro usuário não estiver registrado e -2 se o segundo usuário não estiver registrado.
     * @param {string} userid1 ID do usuário que irá enviar o dinheiro.
     * @param {string} userid2 ID do usuário que irá receber o dinheiro.
     * @param {number} qnt Quantidade de dinheiro que deverá ser enviado.
     */
    transfer(userid1, userid2, qnt) {
        this.jsonOpen();
        const u1 = this.json.users.findIndex(a => a.userid === userid1);
        if (u1 === null || u1 === undefined) {
            this.jsonClose();
            return -1;
        }
        const u2 = this.json.users.findIndex(a => a.userid === userid2);
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
    messages(userid) {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);
        if (user === null) {
            this.jsonClose();
            return -1;
        }
        const msgs = this.json.users[user].messages;
        this.jsonClose();
        return msgs;
    },
    /**
     *
     * @param {string} userid ID do usuário que receberá o dinheiro.
     * @param {number} qnt Quantidade de dinheiro que será dada ao usuário.
     */
    giveMoney(userid, qnt) {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);
        if (user === -1) {
            this.jsonClose();
            return;
        }
        this.json.users[user].money += qnt;
        this.jsonClose();
    },
    /**
     * @returns {number} Retorna null se o usuário não está registrado, um número menor que 0 se ele ainda não pode mendigar de novo, 0 se ele não ganhou nada e um número maior que 0 se o usuário ganhou algo.
     * @param {string} userid ID do usuário
     */
    mendigar(userid) {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);
        if (user === -1) {
            this.jsonClose();
            return null;
        }
        if (this.json.users[user].mendigagem + discordServer.timing.day > Date.now()) {
            const falta = -Math.abs(discordServer.timing.day - (Date.now() - this.json.users[user].mendigagem));
            this.jsonClose();
            return falta;
        }
        this.json.users[user].mendigagem = Date.now();
        if (Math.random() < 0.5) {
            const m = Math.trunc((Math.random()) * 81 + 20);
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
    horseraceJoin(userid, cost) {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);
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
    userinfo(userid) {
        this.jsonOpen();
        const user = this.json.users.find(a => a.userid === userid);
        this.jsonClose();
        return user;
    },
    upgradeMedalha(userid) {
        return 0;
    }
};
