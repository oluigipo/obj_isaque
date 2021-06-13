import { Command, Arguments, Server, Permission, defaultEmbed, notNull, discordErrorHandler } from "../../defs";
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

interface Page {
	title: string;
	link: string;
	image?: string; // url
	description?: string;
	note?: string;
	params?: string;
	returns?: string;
	example?: string;
}

let docs: DocsJson = JSON.parse(fs.readFileSync("./docs.json", "utf8"));
const cache = <{ [key: string]: Page | undefined }>{};

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

async function makeRequest(url: string) {
	return new Promise<{ error: any, body: any }>((resolve, reject) => {
		request(url, {}, (error, res) => {
			resolve({ error, body: res.body });
		});
	});
}

type FetchPageResult = { page: Page, error: 0 } | { link: string, error: 1 } | { error: 2 } | undefined;
async function fetchPage(fn: string): Promise<FetchPageResult> {
	const ind = exists(fn);
	if (ind === -1) return;

	const link = `http://docs2.yoyogames.com/${docs.SearchFiles[ind].replace(/\s/g, '%20')}`;

	if (docs.SearchTitles[ind].toLowerCase() !== docs.SearchTitles[ind]) {
		return { link, error: 1 };
	}

	const final = <Page>{};
	final.title = docs.SearchTitles[ind];
	final.description = "";
	final.link = link;

	const { error, body } = await makeRequest(link);

	if (error) {
		console.log(error);
		return { error: 2 };
	}

	const { document } = new JSDOM(body).window;

	const page = document.getElementsByClassName("body-scroll")[0];
	const image = page.getElementsByTagName("img");
	if (image.length > 0) {
		final.image = `${link.slice(0, link.lastIndexOf('/') + 1)}${image[0].getAttribute("src")}`;
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
		final.note = (<string>noteEle.textContent).replace("NOTE: ", '');
	}

	const params = page.getElementsByClassName("param")[0];
	if (params !== undefined) {
		const ppp = params.getElementsByTagName("tr");
		let f = "";

		for (let i = 1; i < ppp.length; i++) {
			const eee = ppp[i].getElementsByTagName("td");

			f += `\`${eee[0].textContent}\`: ${eee[1].textContent}\n`;
		}

		final.params = f;
	}

	const codes = page.getElementsByClassName("code");
	if (codes.length < 3) {
		return { link, error: 1 };
	}
	final.title = (<string>codes[codes.length - 3].textContent).replace(';', '');

	final.returns = codes[codes.length - 2].textContent ?? undefined;
	final.example = `\`\`\`gml\n${codes[codes.length - 1].textContent}\`\`\``;
	return { page: final, error: 0 };
}

export default <Command>{
	async run(msg: Message, _: Arguments, args: string[]) {
		if (args.length < 2) {
			msg.channel.send(`${msg.author} https://docs2.yoyogames.com/`).catch(discordErrorHandler);
			return;
		}

		let final = defaultEmbed(notNull(msg.member));
		let fn = args.slice(1).join(' ');
		let page: Page;

		// find in the cache
		const cached = cache[fn];
		if (cached) {
			page = cached;
		} else {
			let result = await fetchPage(fn);

			if (result === undefined) {
				let items = closest(fn);

				final.title = "Erro: nome não encontrado!";
				final.description = `Não foi possível achar o nome \`${fn}\`. Você quis dizer algum dos nomes a seguir?`;
				for (const i of items) {
					final.description += `\n[${i.name}](${i.link})`;
				}
				//msg.channel.send(`${msg.author} A função/variável/constante \`${fn}\` não existe. Ela pode ser do GMS1, e este comando funciona somente com o GMS2`);

				let finalMessage = await msg.channel.send(final).catch(discordErrorHandler);
				if (!finalMessage) return;

				const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].slice(0, items.length);

				(async() => {
					for (const number of numbers) {
						const result = await finalMessage.react(number).catch(() => undefined);

						// probably the message was deleted
						if (result === undefined) break;
					}
				})();

				let pageIndexToSend = await finalMessage.awaitReactions(
											((reaction, user) => numbers.includes(reaction.emoji.name) && user.id === msg.author.id),
											{ max: 1, time: 60000, errors: ['time'] })
					.then(collection => {
						return numbers.indexOf(collection.first()?.emoji?.name ?? "");
					})
					.catch(() => -1);

				if (pageIndexToSend !== -1) {
					result = await fetchPage(items[pageIndexToSend].name);
				}

				if (result === undefined) return;

				finalMessage.delete();
			}

			switch (result.error) {
				case 0:
					page = result.page;
					cache[fn] = page;
					break;
				case 1:
					msg.channel.send(`${msg.author} Aqui está o link: ${result.link}`).catch(discordErrorHandler);
					return;
				case 2:
					msg.channel.send(`<@373670846792990720> deu algo de errado... Dá uma olhada no console aí`)
						.catch(discordErrorHandler);
					return;
			}
		}

		final.title = page.title;
		final.description = page.description;
		if (page.image) final.image = { url: page.image };
		if (page.note) final.addField("Note", page.note);
		if (page.params) final.addField("Parameters", page.params);
		if (page.returns) final.addField("Returns", page.returns);
		if (page.example) final.addField("Example", page.example);

		msg.channel.send(final).catch(discordErrorHandler);
	},
	permissions: Permission.NONE,
	aliases: ["docs"],
	syntaxes: ["func"],
	description: "A documentação do GMS2",
	help: "Este comando pesquisa uma palavra na documentação do GMS2 e te diz o resultado da pesquisa. Use a vontade!",
	examples: [`lengthdir_x`, `instance_destroy`, `image_index`]
};