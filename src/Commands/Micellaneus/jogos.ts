import { Command, Arguments, Server, CommonMessages, Permission } from "../../definitions";
import { Message, RichEmbed } from "discord.js";
import fs from "fs";

interface Developer {
	image: string;
	name: string;
	desc: string;
	id: string;
	games: number[]; // indexes
	color: number;
	links: { name: string, url: string; }[];
	tools: string[];
}

interface Game {
	name: string;
	desc: string;
	color: number;
	icon: string | undefined;
	thumbnail: string;
	links: { name: string, url: string; }[];
	devs: number[]; // indexes
}

export default <Command>{
	run: (msg: Message, args: Arguments): void => {

		let final = new RichEmbed();

		const json: { devs: Developer[], games: Game[] } = JSON.parse(fs.readFileSync("./data/games.json", "utf8"));

		function sendGame(game: Game) {
			// pegando informações
			let links = "";
			game.links.forEach(l => {
				links += `[${l.name}](${l.url})\n`;
			});

			let devs = "";
			game.devs.forEach(i => {
				let dev = json.devs[i];
				if (dev === undefined) return;

				devs += (dev.links.length > 0) ? `[${dev.name}](${dev.links[0].url})\n` : `${dev.name}\n`;
			});

			final.title = game.name;
			if (game.desc !== undefined) final.description = game.desc;
			if (game.color !== undefined) final.color = game.color;
			if (game.thumbnail !== undefined) final.image = { url: game.thumbnail };
			if (game.icon !== undefined) final.thumbnail = { url: game.icon };
			if (links !== "") final.addField("Links", links);
			final.addField("Desenvolvedores", devs);
		}

		function sendDev(dev: Developer) {
			// pegando informações
			let links = "";
			dev.links.forEach(l => {
				links += `[${l.name}](${l.url})\n`;
			});

			let games = "";
			dev.games.forEach(i => {
				let game = json.games[i];

				if (game === undefined) return;

				games += (game.links.length > 0) ? `[${game.name}](${game.links[0].url})\n` : `${game.name}\n`;
			});

			// fazendo embed
			final.title = dev.name;
			final.description = dev.desc;
			final.thumbnail = { url: dev.image };
			final.color = dev.color;
			if (games !== "") final.addField("Jogos", games);
			if (links !== "") final.addField("Links", links);
			if (dev.tools.length > 0) final.addField("Ferramentas", dev.tools.reduce((a, c) => a + c + "\n", ""));
		}

		// final.color = 0x30a246;
		final.author = { name: (msg.member.nickname ? msg.member.nickname : msg.author.username), icon_url: msg.author.avatarURL };
		final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };

		if (args.length < 2) {
			let id = msg.author.id;

			let dev = json.devs.find(d => d.id === id);

			if (dev === undefined) {
				msg.channel.send(`${msg.author} Desenvolvedor não encontrado.`);
				return;
			}

			sendDev(dev);
			msg.channel.send(final);
			return;
		}

		if (args[1][0] === '<' && msg.mentions.members.size > 0) { // dev
			let id = msg.mentions.members.first().user.id;

			let dev = json.devs.find(d => d.id === id);

			if (dev === undefined) {
				msg.channel.send(`${msg.author} Desenvolvedor não encontrado.`);
				return;
			}

			sendDev(dev);
		} else { // jogo ou dev
			let name = args.slice(1).join(' ').toLowerCase();
			let game = json.games.find(g => g.name.toLowerCase() === name);

			if (game === undefined) {
				let dev = json.devs.find(d => d.name.toLowerCase() === name);

				if (dev === undefined) {
					msg.channel.send(`${msg.author} Jogo ou desenvolvedor não encontrado.`);
					return;
				}

				sendDev(dev);
			} else sendGame(game);
		}

		msg.channel.send(final);
	},
	permissions: Permission.None,
	aliases: ["jogos", "jogo"],
	shortHelp: "Descubra jogos e desenvolvedores dentro do servidor (Ainda em testes)",
	longHelp: "Descubra jogos e desenvolvedores dentro do servidor! (Ainda em testes)",
	example: `${Server.prefix}jogos nomeDoDev\n${Server.prefix}jogos nomeDoJogo\n${Server.prefix}jogos @dev`
};
