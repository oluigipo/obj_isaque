import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";
import Loteria from "../../Cassino/loteria";

export default <Command>{
	run: (msg: Message, args: Arguments) => {
		if (Loteria.currentLoteria === -1) {
			msg.channel.send(`${msg.author} Não existe nenhuma loteria iniciada!`);
			return;
		}

		const result = Loteria.currentLoteria.pot();
		msg.channel.send(`${msg.author} A quantidade de dinheiro acumulada é ${result}`);
	},
	permissions: Permission.Shitpost | Permission.Cassino,
	aliases: ["pot"],
	shortHelp: "Veja quanto dinheiro está acumulado numa loteria",
	longHelp: "Veja quanto dinheiro está acumulado numa loteria acontecendo agora",
	example: `${Server.prefix}pot`
};