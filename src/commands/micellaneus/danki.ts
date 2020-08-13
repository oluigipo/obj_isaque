// @NOTE(luigi): not checked

import { Command, Arguments, Server, Permission, defaultEmbed, notNull, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";

interface Item {
	url: string;
	title: string;
	description: string;
}

const images: Item[] = [
	{
		url: "https://cdn.discordapp.com/attachments/553933292542361601/633732233156362270/Danki_Boude.png",
		title: "jogos",
		description: "Jogos da seção Java da danki"
	}, {
		url: "https://cdn.discordapp.com/attachments/553933292542361601/633732285547544605/gamedev.png",
		title: "minecraft",
		description: "minecraft sem minecraft"
	}, {
		url: "https://media.tenor.com/images/58d83a905a4fad6d2851f93e1c5b4851/tenor.gif",
		title: "investimento",
		description: "ótimo investimento"
	}, {
		url: "https://media.tenor.com/images/ecf2f98818f6f9520a8e38a2cb7cb143/tenor.gif",
		title: "?",
		description: "o que você disse?"
	}, {
		url: "https://cdn.discordapp.com/attachments/507551338616586264/641328025488588800/sanfjasfjasf-1.gif",
		title: "redimensionar",
		description: "grande grilo tentando redimensionar\num objeto na room"
	}, {
		url: "https://media.discordapp.net/attachments/507551338616586264/615291066056179712/aaa.gif",
		title: "gta",
		description: "gta 1000"
	}, {
		url: "https://cdn.discordapp.com/attachments/507550989629521924/668598675890634752/dankitetris.gif",
		title: "tetris",
		description: "\"O que importa são as mecânicas.\""
	}, {
		url: "https://cdn.discordapp.com/attachments/553933292542361601/702235037252321310/unknown.png",
		title: "pacman",
		description: "super pacman"
	}, {
		url: "https://cdn.discordapp.com/attachments/553933292542361601/702243425877098646/danki_flappy.gif",
		title: "flappy",
		description: "flappy bird vs gravidade"
	}, {
		url: "https://cdn.discordapp.com/attachments/553933292542361601/702244637280043249/danki_corrida.gif",
		title: "corrida",
		description: "drift"
	}, {
		url: "https://imgur.com/U1Ir6HI",
		title: "minecraft3d",
		description: "colisão 100%"
	}, {
		url: "https://cdn.discordapp.com/attachments/553933292542361601/702250564511334530/danki_spave_invaders.gif",
		title: "invaders",
		description: "space invaders... INVADERS!"
	}, {
		url: "https://media.discordapp.net/attachments/553933292542361601/702175545596706836/danki.png",
		title: "bob",
		description: "bob esponja sabe"
	}
];
let dankiImageCurrent = 0;

function roll() {
	dankiImageCurrent = (dankiImageCurrent + 1) % images.length;
	return images[dankiImageCurrent];
}

export default <Command>{
	async run(msg: Message, _: Arguments, args: string[]) {
		let curr: Item;

		if (args.length < 2) {
			curr = roll();
		} else {
			let tmp = images.find(item => item.title === args[1]);

			if (tmp === void 0)
				curr = roll();
			else
				curr = tmp;
		}

		let final = defaultEmbed(notNull(msg.member));
		final.image = { url: curr.url };
		final.title = curr.title;
		final.description = curr.description;
		final.color = Server.botcolor;

		msg.channel.send(final)
			.catch(discordErrorHandler);
	},
	permissions: Permission.SHITPOST,
	aliases: ["danki", "dankicode"],
	description: "Envia um meme da danki",
	help: "Envia um meme da danki",
	examples: [`${Server.prefix}danki`]
};
