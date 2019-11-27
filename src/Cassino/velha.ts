import { Message } from "discord.js";
import { Bank } from "./index";
import { Time } from "../definitions";

/**@returns {string} Player's ID */
type Player = string;

interface Request {
    players: Player[];
    price: number;
    date: number;
}

enum Spot {
    X, O, FREE
}

type Table = Spot[];

interface Run {
    table: Table;
    players: Player[];
    time: Spot.X | Spot.O;
    price: number;
}

export default class Velha {
    static requests: Request[] = [];
    static running: Run[] = [];
    static playing: Player[] = [];
    static timerRunning: boolean = false;
    static maxRequestTime: number = Time.minute;
    static get winningCombinations(): number[][] {
        return [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    }

    static checkRequests(): void {
        const now = Date.now();

        if (this.requests === undefined) this.requests = [];
        for (let i = 0; i < this.requests.length;) {
            if (this.requests[i].date + this.maxRequestTime > now) {
                this.requests = this.requests.filter(a => a !== this.requests[i]);
                continue;
            }

            ++i;
        }

        if (this.requests.length > 0) {
            setTimeout(this.checkRequests, Time.second);
        } else {
            this.timerRunning = false;
        }
    }

    static makeRequest(p1: Player, p2: Player, price: number): boolean {
        if (
            this.requests.some(r => r.players.some(p => p === p1 || p === p2)) || !Bank.isRegistered(p1) || !Bank.isRegistered(p2)
            || Bank.saldo(p1) < price || Bank.saldo(p2) < price
        ) return false;

        this.requests.push({ players: [p1, p2], date: Date.now(), price: price });
        if (!this.timerRunning) {
            setTimeout(this.checkRequests, Time.second);
        }
        this.timerRunning = true;
        return true;
    }

    static acceptRequest(p: Player): boolean {
        for (let i = 0; i < this.requests.length; i++) {
            if (this.requests[i].players[1] === p) {
                let j = this.running.push({ table: this.makeTable(), players: this.requests[i].players, time: Math.floor(Math.random() * Spot.FREE), price: this.requests[i].price });
                this.requests = this.requests.filter(a => a !== this.requests[i]);
                return true;
            }
        }

        return false;
    }

    static makePlay(p: Player, r: number): Table | -1 | 0 | { w: Table, p: Player | -1 } {
        for (let i = 0; i < this.running.length; i++) {
            let run = this.running[i];
            if (run.players[run.time] === p) {
                if (run.table[r] !== Spot.FREE) {
                    return 0;
                }
                run.table[r] = run.time;

                let win = this.checkResult(run.table, run.time);
                if (win !== 0) {
                    let p: string | -1 = (win === -1 ? -1 : run.players[run.time]);
                    if (p !== -1) {
                        Bank.transfer(run.players[__aa(run.time)], p, run.price);
                    }
                    let toR = <{ w: Table, p: Player | -1 }>{ w: run.table, p: p };
                    this.running = this.running.filter(aa => aa !== run);
                    return toR;
                }

                run.time = __aa(run.time);

                return run.table;
            }
        }

        return -1;

        function __aa(s: Spot) {
            return s === Spot.X ? Spot.O : Spot.X;
        }
    }

    static checkResult(t: Table, s: Spot.X | Spot.O): -1 | 0 | 1 {
        for (let i = 0; i < this.winningCombinations.length; i++) {
            let check = 0;
            for (let j = 0; j < this.winningCombinations[i].length; j++) {
                if (t[this.winningCombinations[i][j]] === s)++check;
            }

            if (check === 3) {
                return 1;
            }
        }

        if (t.filter(tt => tt === Spot.FREE).length === 0) {
            return -1;
        }

        return 0;
    }

    static cancelMatch(p: Player): -1 | 0 | 1 {
        for (let i = 0; i < this.requests.length; i++) {
            if (this.requests[i].players.includes(p)) {
                this.requests = this.requests.filter(rr => rr !== this.requests[i]);
                return 1;
            }
        }

        for (let i = 0; i < this.running.length; i++) {
            if (this.running[i].players.includes(p)) {
                Bank.transfer(p, this.running[i].players.filter(pp => pp !== p)[0], this.running[i].price);

                this.running = this.running.filter(rr => rr !== this.running[i]);
                return 0;
            }
        }

        return -1;
    }

    static getTable(p: Player): Table | -1 {
        for (let i = 0; i < this.running.length; i++) {
            if (this.running[i].players.includes(p))
                return this.running[i].table;
        }

        return -1;
    }

    static makeTable(): Table {
        return (new Array<Spot>(9)).fill(Spot.FREE);
    }

    static isPlaying(p: Player): boolean {
        return this.running.some(r => r.players.some(pp => pp === p));
    }
}