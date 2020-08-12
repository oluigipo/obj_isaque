// @NOTE(luigi): no revision

import { Command, Arguments, Server, Permission, defaultEmbed, notNull } from "../../defs";
import { Message } from "discord.js";
import * as stringSimilarity from 'string-similarity';
import request from 'request';
import { JSDOM } from "jsdom";
import fs from 'fs';

// http://docs2.yoyogames.com/files/searchdat.js
// http://docs2.yoyogames.com/

interface DocsJson {
	SearchFiles: string[];
	SearchTitles: string[];
}

interface Item {
	link: string;
	name: string;
}

let docs: DocsJson = JSON.parse(fs.readFileSync("./docs.json", "utf8"));

function makeRGB(r: number, g: number, b: number): number {
	return (r << 16) | (g << 8) | (b);
}

function exists(fn: string): number {
	return docs.SearchTitles.indexOf(fn);
}

function closest(fn: string): Item[] {
	let result: { index: number, score: number }[] = [];

	let minScore = 0;
	function getMinScore() {
		minScore = (result = result.sort((a, b) => a.score - b.score))[0].score;
	}

	for (let i = 0; i < docs.SearchTitles.length; i++) {
		let similarity = stringSimilarity.compareTwoStrings(docs.SearchTitles[i], fn);

		if (similarity > minScore) {
			if (result.length > 5) result.shift();
			result.push({ index: i, score: similarity });

			getMinScore();
		}
	}

	let final: Item[] = result.map((a) => { return { name: docs.SearchTitles[a.index], link: `http://docs2.yoyogames.com/${docs.SearchFiles[a.index].replace(/\s+/g, '%20')}` }; });
	return final.reverse();
}

export default <Command>{
	async run(msg: Message, _: Arguments, args: string[]) {
		if (args.length < 2) {
			msg.channel.send(`${msg.author} https://docs2.yoyogames.com/`);
			return;
		}

		let final = defaultEmbed(notNull(msg.member));

		try {
			let fn = args[1];
			let ind = exists(fn);
			if (ind === -1) {
				let items = closest(fn);

				final.title = "Erro: nome não encontrado!";
				final.description = `Não foi possível achar o nome \`${fn}\`. Você quis dizer algum dos nomes a seguir?`;
				items.forEach(i => {
					final.description += `\n[${i.name}](${i.link})`;
				});
				//msg.channel.send(`${msg.author} A função/variável/constante \`${fn}\` não existe. Ela pode ser do GMS1, e este comando funciona somente com o GMS2`);

				msg.channel.send(final);
			} else {
				const link = `http://docs2.yoyogames.com/${docs.SearchFiles[ind].replace(/\s/g, '%20')}`;

				if (docs.SearchTitles[ind].toLowerCase() !== docs.SearchTitles[ind]) {
					msg.channel.send(`${msg.author} Aqui está o link: ${link}`);
					return;
				}

				final.title = docs.SearchTitles[ind];
				final.description = "";
				final.url = link;
				request(link, {}, (error, response) => {
					if (error) {
						msg.channel.send(`<@373670846792990720> deu algo de errado... Dá uma olhada no console aí`);
						console.log(error);
						return;
					}
					const { document } = new JSDOM(response.body).window;

					const page = document.getElementsByClassName("body-scroll")[0];
					const image = page.getElementsByTagName("img");
					if (image.length > 0) {
						final.image = { url: `${link.slice(0, link.lastIndexOf('/') + 1)}${image[0].getAttribute("src")}` };
					}

					const descriptionEle = page.getElementsByTagName("blockquote")[0];
					const noteEle = descriptionEle.getElementsByClassName("note")[0];

					let description: any = descriptionEle.getElementsByTagName("p");

					if (description.length === 0) {
						let mmmmmm = Math.max(
							(<string>descriptionEle.textContent).indexOf("NOTES"),
							(<string>descriptionEle.textContent).indexOf("IMPORTANT"),
							(<string>descriptionEle.textContent).indexOf("WARNING")
						);
						description = (<string>descriptionEle.textContent).slice(0, mmmmmm !== -1 ? mmmmmm : undefined);
					} else {
						description = description[0].textContent;
					}

					if (description !== null) final.description += description;
					if (noteEle !== undefined) {
						final.addField("Note", (<string>noteEle.textContent).replace("NOTE: ", ''));
					}

					const params = page.getElementsByClassName("param")[0];
					if (params !== undefined) {
						const ppp = params.getElementsByTagName("tr");
						let f = "";

						for (let i = 1; i < ppp.length; i++) {
							const eee = ppp[i].getElementsByTagName("td");

							f += `\`${eee[0].textContent}\`: ${eee[1].textContent}\n`;
						}

						final.addField("Parameters (name: desc)", f);
					}

					const codes = page.getElementsByClassName("code");
					final.title = (<string>codes[codes.length - 3].textContent).replace(';', '');

					final.addField("Returns", codes[codes.length - 2].textContent);
					final.addField("Example", `\`\`\`js\n${codes[codes.length - 1].textContent}\`\`\``);
					msg.channel.send(final);
				});
			}
		} catch (e) {
			msg.channel.send(`<@373670846792990720> deu algo de errado... Dá uma olhada no console aí`);
			console.log(e);
		}
	},
	permissions: Permission.NONE,
	aliases: ["docs"],
	syntaxes: ["func"],
	description: "A documentação do GMS2",
	help: "Este comando pesquisa uma palavra na documentação do GMS2 e te diz o resultado da pesquisa. Use a vontade!",
	examples: [`${Server.prefix}docs algumaCoisa\n${Server.prefix}docs lengthdir_x\n${Server.prefix}docs instance_destroy\n${Server.prefix}docs image_index`]
};