import fs from "fs";
import { Files, Time } from './../definitions';
import Corrida from "./corrida";

export const messagesPerMoney = 100;
export const MoneyGet = {
    mendigar: 100,
    messages: 100,
    semanal: 100
};

export interface User {
    userid: string;
    money: number;
    messages: number;
    last: number;
    mendigagem: number;
    medalha: number;
    lastMedalha: number;
}

interface UsersJson {
    users: User[];
}

export const Bank = {
    json: <UsersJson>{},
    jsonIsOpen: false,
    jsonOpen(): void {
        const raw: string = fs.readFileSync(Files.cassino, 'utf8');
        this.json = JSON.parse(raw);
        this.jsonIsOpen = true;
    },
    jsonClose(): void {
        const text = JSON.stringify(this.json);
        fs.writeFileSync(Files.cassino, text);
        this.json = <UsersJson>{};
        this.jsonIsOpen = false;
    },
    isRegistered(userid: string): boolean {
        this.jsonOpen();
        const result = this.json.users.some(a => a.userid === userid);
        this.jsonClose();
        return result;
    },
    register(userid: string): boolean {
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
    weekMoney(userid: string): number {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);

        if (user === -1) {
            this.jsonClose();
            return 0;
        }

        if (this.json.users[user].last + Time.week <= Date.now()) {
            this.json.users[user].money += MoneyGet.semanal;
            this.json.users[user].last = Date.now();
            this.jsonClose();
            return MoneyGet.semanal;
        } else {
            const falta = -Math.abs(Time.week - (Date.now() - this.json.users[user].last));
            this.jsonClose();
            return falta;
        }
    },
    /**
     * @returns {number} Retorna -1 se o usuário não está registrado, 0 se ele não recebeu nada e um número maior que 0 se ele recebeu algo.
     * @param {string} userid Id do usuário
     */
    userMessage(userid: string): number {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);

        if (user === -1) {
            this.jsonClose();
            return -1;
        }

        this.json.users[user].messages++;
        if (this.json.users[user].messages >= messagesPerMoney) {
            this.json.users[user].messages -= messagesPerMoney;
            this.json.users[user].money += MoneyGet.messages;
            this.jsonClose();
            return MoneyGet.messages;
        } else {
            this.jsonClose();
            return 0;
        }
    },

    /**
     * @returns {boolean} Retorna false se o usuário for inválido ou se o usuário não estiver registrado. True se o dinheiro for descontado com sucesso.
     * @param {string} userid ID do usuário.
     * @param {number} qnt Quantidade de dinheiro para ser descontada.
     */
    userPunish(userid: string, qnt: number): boolean {
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
    saldo(userid: string): number {
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
    transfer(userid1: string, userid2: string, qnt: number): 1 | 0 | -1 | -2 {
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
    messages(userid: string): number {
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
     * @returns {boolean} True se o dinheiro foi somado e False se o usuário não estiver registrado.
     * @param {string} userid ID do usuário que receberá o dinheiro.
     * @param {number} qnt Quantidade de dinheiro que será dada ao usuário.
     */
    giveMoney(userid: string, qnt: number): boolean {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);

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
    mendigar(userid: string): number | null {
        this.jsonOpen();
        const user = this.json.users.findIndex(a => a.userid === userid);

        if (user === -1) {
            this.jsonClose();
            return null;
        }

        if (this.json.users[user].mendigagem + Time.day > Date.now()) {
            const falta = -Math.abs(Time.day - (Date.now() - this.json.users[user].mendigagem));
            this.jsonClose();
            return falta;
        }
        this.json.users[user].mendigagem = Date.now();

        if (Math.random() < 0.5) {
            const m = Math.trunc((Math.random()) * 81 + 20);
            this.json.users[user].money += m;
            this.jsonClose();
            return m;
        } else {
            this.jsonClose();
            return 0;
        }
    },

    /**
     * @returns {number} Retorna -1 se o usuário não estiver registrado e -2 caso o usuário não tenha dinheiro o suficiente. Caso contrário retornará 0.
     * @param {string} userid ID do usuário.
     * @param {number} cost Custo da corrida.
     */
    horseraceJoin(userid: string, cost: number): number {
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

    userinfo(userid: string): User | undefined {
        this.jsonOpen();
        const user = this.json.users.find(a => a.userid === userid);
        this.jsonClose();
        return user;
    }
};