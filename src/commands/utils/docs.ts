import { Command, Argument, Permission } from "../index";
import { Message, GuildMember } from "discord.js";
import * as stringSimilarity from 'string-similarity';
import fs from 'fs';
import * as Common from "../../common";

type Table = string[][];

interface LocaleStrings {
	note: string;
	constants: string;
	params: string;
	returns: string;
	example: string;
	syntax: string;
	redirected: string;
}

interface DefinitionPage {
	kind: "defpage";
	url: string;
	name: string;
	syntax: string;
	description: string;
	notes: string[];
	constants?: Table;
	params?: Table;
	returns: string;
	returnConstants?: Table;
	imageUrl?: string;
	example: string;
}

interface ReferencePage {
	kind: "refpage";
	url: undefined;
	references: string[];
}

type Page = DefinitionPage | ReferencePage;

interface Documentation {
	mainPageUrl: string;
	localesStrings: LocaleStrings;
	pages: { [key: string]: Page };
}

let docsEnglish: Documentation = JSON.parse(fs.readFileSync("./docs/gms-en.json", "utf8"));
let docsPortuguese: Documentation = JSON.parse(fs.readFileSync("./docs/gms-br.json", "utf8"));

type ClosestPages = { name: string, url: string, isRef: boolean }[];
function closest(docs: Documentation, fn: string): ClosestPages {
	let result: { index: number, score: number }[] = [];

	const keys = Object.keys(docs.pages);
	for (let i = 0; i < keys.length; i++) {
		let similarity = stringSimilarity.compareTwoStrings(keys[i], fn);
		result.push({ index: i, score: similarity });
	}

	// Do not try to read this.
	let final: ClosestPages = result
		.sort((a, b) => b.score - a.score)
		.slice(0, 5)
		.map((a) => {
			let result = { name: keys[a.index], url: "", isRef: false };
			let url = docs.pages[keys[a.index]].url;

			if (!url) {
				let reference = ( <ReferencePage>docs.pages[keys[a.index]] ).references[0];
				url = <string>docs.pages[reference].url;
				result.isRef = true;
			}

			result.url = url;
			return result;
		});

	return final;
}

function tableToText(table: Table): string {
	let result = "";

	for (const row of table) {
		result += `\`${row[0]}\`: ${row[1]}\n`;
	}

	return result.trim();
}

function sendPage(msg: Message<true>, locale: LocaleStrings, page: DefinitionPage, redirected?: string) {
	let embed = Common.defaultEmbed(Common.notNull(msg.member));
	let truncated = false;

	function addField(name: string, data: any) {
		let str = String(data);
		if (str.length == 0) return;
		if (str.length > 1024) {
			str = str.slice(0, 1024);
			truncated = true;
		}

		embed.fields.push({ name, value: str });
	}

	
	embed.title = page.name
	embed.description = page.description;
	embed.url = page.url;
	if (redirected)
		embed.title += ` - ${locale.redirected} (${redirected})`;
	if (page.constants)
		addField(locale.constants, tableToText(page.constants));
	if (page.imageUrl)
		embed.image = { url: page.imageUrl };
	for (const note of page.notes)
		addField(locale.note + ":", note);
	if (page.syntax)
		addField(locale.syntax, `\`${page.syntax}\``);
	if (page.params && page.params.length > 0)
		addField(locale.params, tableToText(page.params));
	if (page.returns)
		addField(locale.returns, page.returns);
	if (page.returnConstants)
		addField(locale.constants, tableToText(page.returnConstants));
	if (page.example)
		addField(locale.example, page.example);

	if (!Common.validateEmbed(embed)) {
		msg.reply(`Aqui está o link. Infelizmente essa página é muito grande para o discord aguentar 😔\n${page.url}`).catch(Common.discordErrorHandler);
	}

	let m = !truncated ? undefined : "OBS: essa página era muito grande para eu conseguir enviá-la por completo 😔";
	msg.channel.send({ content: m, embeds: [embed] }).catch(Common.discordErrorHandler);
}

export default <Command> {
	async run(msg: Message<true>, args: Argument[], raw: string[]) {
		let docs = docsEnglish;

		if (["docsbr", "gmdocsbr"].includes(raw[0])) {
			docs = docsPortuguese;
		}

		if (raw.length < 2) {
			msg.reply(docs.mainPageUrl).catch(Common.discordErrorHandler);
			return;
		}

		const query = raw.slice(1).join(' ');
		let redirected: string | undefined = undefined;
		let page = docs.pages[query];

		if (page) {
			if (page.url === undefined) {
				page = <DefinitionPage>docs.pages[page.references[0]];
				redirected = query;
			}
		} else {
			const funcs = closest(docs, query);

			let embed = Common.defaultEmbed(<any>msg.member);
			embed.description = `Não foi possível encontrar a página de \`${query}\`. Você quis dizer algumas das seguintes dessas?\n`;

			for (const fn of funcs) {
				embed.description += `\n[${fn.name}](${fn.url})`;

				if (fn.isRef)
					embed.description += " (Redirected)";
			}

			const finalmsg = await msg.channel.send({ embeds: [embed] }).catch(Common.discordErrorHandler);
			if (!finalmsg)
				return;

			const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].slice(0, funcs.length);

			(async() => {
				for (const number of numbers) {
					const result = await finalmsg.react(number).catch(() => undefined);

					// probably the message was deleted
					if (result === undefined) break;
				}
			})();

			let pageIndexToSend = await finalmsg.awaitReactions({
				max: 1, time: 60000, errors: ['time'],
				filter: ((reaction: any, user: any) => numbers.includes(reaction.emoji.name) && user.id === msg.author.id),
			}).then(collection => {
				return numbers.indexOf(collection.first()?.emoji?.name ?? "");
			}).catch(() => -1);

			if (pageIndexToSend !== -1) {
				page = docs.pages[funcs[pageIndexToSend].name];
			} else {
				return;
			}

			if (page.url === undefined) {
				page = <DefinitionPage>docs.pages[page.references[0]];
				redirected = query;
			}

			finalmsg.delete();
		}

		sendPage(msg, docs.localesStrings, page, redirected);
	},
	permissions: Permission.NONE,
	aliases: ["docs", "docsbr", "gmdocs", "gmdocsbr"],
	syntaxes: ["func"],
	description: "A documentação do GMS2",
	help: "Este comando pesquisa uma palavra na documentação do GMS2 e te diz o resultado da pesquisa. Use a vontade!",
	examples: [`lengthdir_x`, `instance_destroy`, `image_index`]
};
