import { Bank } from "./index";

export let currentLoteria: Loteria | -1 = -1;

export class Loteria {
    participantes: string[] = [];
    custo: number;
    constructor(custo: number) {
        this.custo = custo;
    }

    static setCurrent(a: Loteria | -1) {
        currentLoteria = a;
    }

    /**
     * @returns {number} Retorna -1 se o usuário já tiver comprado algum bilhete, caso contrário retorna a quantidade de bilhetes compradas
     * @param {string} user 
     * @param {number} qnt
     */
    bilhete(user: string, qnt: number): number {
        if (this.participantes.some(a => a === user)) return -1;
        Bank.jsonOpen();
        const userindex = Bank.json.users.findIndex(a => a.userid === user);
        let i;
        for (i = 0; i < qnt; i++) {
            if (Bank.json.users[userindex].money < this.custo) break;

            this.participantes.push(user);
            Bank.json.users[userindex].money -= this.custo;
        }
        Bank.jsonClose();
        return i;
    }

    /**
     * @returns {number} A quantidade de dinheiro já acumulada.
     */
    pot(): number {
        return this.participantes.length * this.custo;
    }

    /**
     * @returns {object | undefined} Retorna o ID do usuário vencedor e a quantidade de dinheiro obtida. {user: string, money: number}
     */
    resultado(): object | undefined {
        if (this.participantes.length === 0) return undefined;
        const result = Math.min(Math.floor(Math.random() * this.participantes.length), this.participantes.length - 1);
        const moneyWon = this.participantes.length * this.custo;
        Bank.jsonOpen();
        const ind = Bank.json.users.findIndex(a => a.userid === this.participantes[result]);
        Bank.json.users[ind].money += moneyWon;
        const toReturn = { user: this.participantes[result], money: moneyWon };
        Bank.jsonClose();
        return toReturn;
    }
}