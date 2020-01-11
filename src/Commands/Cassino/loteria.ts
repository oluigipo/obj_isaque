import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";
import { Bank } from "../../Cassino";
import Loteria from "../../Cassino/loteria";

export default <Command>{
	run: (msg: Message, args: Arguments) => {
		if (Loteria.currentLoteria !== -1) {
			msg.channel.send(`${msg.author} Já existe uma loteria rolando!`);
			return;
		}
		if (args.length < 2) {
			msg.channel.send(`${msg.author} Informe quanto custará cada bilhete da loteria!`);
			return;
		}

		const preco = Number(args[1]);
		if (isNaN(preco) || preco <= 0 || preco !== Math.trunc(preco)) {
			msg.channel.send(`${msg.author} Preço dos bilhetes inválido!`);
			return;
		}

		Loteria.currentLoteria = new Loteria(Number(args[1]));
		msg.channel.send(`${msg.author} Loteria iniciada!`);
	},
	permissions: Permission.Staff,
	aliases: ["loteria"],
	shortHelp: "Inicie uma loteria",
	longHelp: "Inicie uma loteria",
	example: `${Server.prefix}loteria valorDeCadaBilhete`
};