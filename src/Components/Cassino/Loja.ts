import { Banco, usersJsonUser } from './Banco';
import { Message } from 'discord.js';

interface Item {
    name: string;
    cost: number;
}

const itens: Item[] = [];

const Loja = {
    upgrade(msg: Message, args: string[]): void {
        let user = args.length > 1 ? args[1] : msg.author.id;

    }
};

export default Loja;