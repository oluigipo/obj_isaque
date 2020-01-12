import { Command, Arguments, Server, CommonMessages, Permission } from "../../definitions";
import { Message } from "discord.js";
import { Bank } from "../../Cassino";

const fruitsEmojis = ['🍒', '🍎', '🍇', '🍓', '🥕'];

type Player = string;
enum Fruit {
	CHERRY,
	APPLE,
	GRAPES,
	STRAWBERRY,
	CARROT
}

function makeBet(p: Player, bet: number, msg: Message): -1 | 0 | 1 {
	const saldo = Bank.saldo(p);

	if (saldo === -1)
		return -1;

	if (saldo < bet)
		return 0;

	gameRun(p, bet, msg);
	return 1;
}

async function gameRun(p: Player, bet: number, msg: Message): Promise<void> {

}

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 2) {
			msg.channel.send(CommonMessages.syntaxError);
			return;
		}

		const aposta = Number(args[1]);

		if (isNaN(aposta) || aposta < 0) {
			msg.channel.send(`${msg.author} Aposta inválida!`);
			return;
		}

		msg.channel.send("...")
			.then((m: Message | Message[]) => {
				m = <Message>m;
				const result = makeBet(msg.author.id, aposta, m);

				if (result === -1) {
					m.edit(`${msg.author} Você não está registrado!`);
				} else if (result === 0) {
					m.edit(`${msg.author} Você não tem dinheiro o suficiente!`);
				}
			})
	},
	permissions: Permission.Shitpost | Permission.Cassino,
	aliases: ["slotmachine", "caçaniquel", "slotm"],
	shortHelp: "Slot-Machine",
	longHelp: "",
	example: `${Server.prefix}slotmachine aposta    | Realizar uma aposta\n${Server.prefix}slotmachine confirm   | Confirmar a aposta`
};