import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

const secrets: string[] = [];

export default <Command>{
	async run(msg: Message<true>, args: Argument[], raw: string[]) {
		if (Math.random() < 0.001 && secrets.length) {
			const image = secrets[Math.floor(Math.random() * secrets.length)];

			msg.channel.send({
				content: `${msg.author} Você encontrou o cachorro secreto <:pepe_omg:746842550530342912>`,
				embeds: [{ ...Common.emptyEmbed(), image: { url: image } }]
			}).catch(Common.discordErrorHandler);
		} else {
			Common.simpleRequest("https://dog.ceo/api/breeds/image/random").then(data => {
				const image = JSON.parse(data).message;
				msg.channel.send(image).catch(Common.discordErrorHandler);
			}).catch(err => {
				msg.reply("deu isso aqui de errado, ó: `${err}`").catch(Common.discordErrorHandler);
				Common.error(err);
			});
		}
	},
	aliases: ["dog", "cachorro"],
	syntaxes: [""],
	description: "Pega uma imagem aleatória de um cachorro. (feito por <@310480160640073729>)",
	help: "Pega uma imagem aleatória de um cachorro. (feito por <@310480160640073729>)",
	examples: [""],
	permissions: Permission.SHITPOST
}
