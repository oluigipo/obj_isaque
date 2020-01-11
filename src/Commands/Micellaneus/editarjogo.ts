import { Command, Arguments, Server, CommonMessages, Permission } from "../../definitions";
import { Message } from "discord.js";
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

let loaded: Game | -1 = -1;
let index: number = -1;
let editing: string;

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 2) {
			msg.channel.send(`${msg.author} ${CommonMessages.syntaxError}`);
			return;
		}

		function checkArgs(n: number): boolean {
			if (args.length < n) {
				msg.channel.send(`${msg.author} ${CommonMessages.syntaxError}`);
				return false;
			}
			return true;
		}

		args.shift();
		let cmd = args.shift();
		if (cmd === "script") {
			let a: string = args.join(' ');
			if (a.startsWith("```")) a = a.slice(3, a.length - 3);
			while (a.startsWith("\n")) a = a.slice(1, a.length);
			while (a.endsWith("\n")) a = a.slice(0, a.length - 1);

			let commands = a.split('\n');
			commands.forEach(c => {
				args = c.split(' ');
				cmd = args.shift();
				execute(cmd);
			});
		} else execute(cmd);

		function execute(c: string | undefined) {
			switch (c) {
				case "create":
					if (!checkArgs(1)) return;
					if (loaded !== -1) {
						msg.channel.send(`${msg.author} Já existe um jogo selecionado.`);
						return;
					}
					loaded = <Game>{ name: args.join(' '), links: <{ name: string, url: string; }[]>[], devs: <number[]>[] };
					msg.channel.send(`${msg.author} Jogo criado!`);
					break;
				case "select": {
					if (!checkArgs(1)) return;
					if (loaded !== -1) {
						msg.channel.send(`${msg.author} Já existe um jogo selecionado.`);
						return;
					}
					const json: { devs: any, games: Game[] } = JSON.parse(fs.readFileSync("./data/games.json", "utf8"));
					index = json.games.findIndex(g => g.name.toLowerCase() === args.join(' ').toLowerCase());
					if (index === -1) {
						msg.channel.send(`${msg.author} Esse jogo não existe.`);
						return;
					}

					loaded = json.games[index];
					msg.channel.send(`${msg.author} Jogo selecionado!`);
				} break;
				case "name": {
					if (!checkArgs(1)) return;
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}
					loaded.name = args.join(' ');
					msg.channel.send(`${msg.author} Nome selecionado!`);
				} break;
				case "desc": {
					if (!checkArgs(1)) return;
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}
					loaded.desc = args.join(' ');
					msg.channel.send(`${msg.author} Descrição selecionada!`);
				} break;
				case "color": {
					if (!checkArgs(1)) return;
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}
					loaded.color = parseInt(args[0], 16);
					msg.channel.send(`${msg.author} Cor selecionada!`);
				} break;
				case "icon": {
					if (!checkArgs(1)) return;
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}
					loaded.icon = args.join('%20');
					msg.channel.send(`${msg.author} Ícone selecionado!`);
				} break;
				case "thumbnail": {
					if (!checkArgs(1)) return;
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}
					loaded.thumbnail = args.join('%20');
					msg.channel.send(`${msg.author} Thumbnail selecionada!`);
				} break;
				case "addlink": {
					if (!checkArgs(2)) return;
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}
					loaded.links.push({ name: args[0], url: args.slice(1).join('%20') });
					msg.channel.send(`${msg.author} Link adicionado!`);
				} break;
				case "editlink": {
					if (!checkArgs(2)) return;
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}
					let i = loaded.links.findIndex(l => l.name === args[0]);
					if (i === -1) {
						msg.channel.send(`${msg.author} Esse link não existe.`);
						return;
					}

					loaded.links[i].url = args.slice(1).join('%20');
					msg.channel.send(`${msg.author} Link editado!`);
				} break;
				case "removelink": {
					if (!checkArgs(1)) return;
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}
					loaded.links = loaded.links.filter(l => l.name !== args[0]);
					msg.channel.send(`${msg.author} Link removido!`);
				} break;
				case "toplink": {
					if (!checkArgs(1)) return;
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}
					loaded.links = loaded.links.sort((a, b) => Number(b.name === args[0]));

					msg.channel.send(`${msg.author} Top Link selecioado!`);
				} break;
				case "dev": {
					if (!checkArgs(1)) return;
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}
					const json: { devs: Developer[], games: Game[] } = JSON.parse(fs.readFileSync("./data/games.json", "utf8"));

					if (loaded.devs === undefined) loaded.devs = [];

					let added = false;
					msg.mentions.users.forEach(u => {
						json.devs.forEach((d, i) => {
							if (d.id === u.id && loaded !== -1) {
								added = true;
								loaded.devs.push(i);
							}
						});
					});
					if (added)
						msg.channel.send(`${msg.author} Desenvolvedores adicionados!`);
					else
						msg.channel.send(`${msg.author} Desenvolvedores não encontrados.`);
				} break;
				case "save": {
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}

					const json: { devs: Developer[], games: Game[] } = JSON.parse(fs.readFileSync("./data/games.json", "utf8"));

					if (index === -1) {
						index = json.games.push(loaded);
					} else {
						json.games[index] = loaded;
					}

					json.devs.forEach((d, i) => {
						if (!d.games.includes(index) && (<Game>loaded).devs.includes(i))
							d.games.push(index);
					});

					fs.writeFileSync("./data/games.json", JSON.stringify(json), "utf8");

					index = -1;
					loaded = -1;

					msg.channel.send(`${msg.author} Jogo salvo com sucesso!`);
				} break;
				case "cancel": {
					if (loaded === -1) {
						msg.channel.send(`${msg.author} Nenhum jogo selecionado.`);
						return;
					}

					loaded = -1;
					index = -1;
					msg.channel.send(`${msg.author} Ação concluída com sucesso!`);
				} break;
				default: {
					msg.channel.send(`${msg.author} Este comando não foi encontrado.`);
					return;
				}
			}
		}
	},
	permissions: Permission.Staff,
	aliases: ["editarjogo", "editgame", "game"],
	shortHelp: "Editar os jogos registrados no bot",
	longHelp: "Comando para editar, criar e deletar jogos no sistema do bot.",
	example: `Coisas básicas:
	\`${Server.prefix}editarjogo create nomeDoJogo\` Cria um novo jogo e seleciona ele.
	\`${Server.prefix}editarjogo select nomeDoJogo\` game_load().
	\`${Server.prefix}editarjogo name nomeDoJogo\` Edita o nome do jogo selecionado.
	\`${Server.prefix}editarjogo dev @dev...\` Adiciona um ou mais desenvolvedores ao jogo selecionado.
	\`${Server.prefix}editarjogo save\` game_save().
	\`${Server.prefix}editarjogo cancel\` Cancela a criação de um jogo.
	Extras:
	\`${Server.prefix}editarjogo thumbnail link\` Edita a thumbnail do jogo selecionado.
	\`${Server.prefix}editarjogo addlink nomeDoLink link\` Adiciona um link ao jogo selecionado.
	\`${Server.prefix}editarjogo editlink nomeDoLink link\` Edita um link do jogo selecionado.
	\`${Server.prefix}editarjogo removelink nomeDoLink\` Remove um link do jogo selecionado.
	\`${Server.prefix}editarjogo toplink nomeDoLink\` Seleciona um link principal para o jogo selecionado.
	\`${Server.prefix}editarjogo desc descrição\` Edita a descrição do jogo selecionado.
	\`${Server.prefix}editarjogo color rgbEmHex\` Edita a cor do jogo selecionado.
	\`${Server.prefix}editarjogo icon link\` Edita o ícone do jogo selecionado.`
};