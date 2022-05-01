import { Command, Argument, Permission } from "../index";
import { Message, MessageAttachment } from "discord.js";
import * as Common from "../../common";

const secrets: string[] = [];

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (Math.random() < 0.001 && secrets.length) {
			const image = secrets[Math.floor(Math.random() * secrets.length)];

			msg.channel.send({
				content: `${msg.author} Você encontrou o pato secreto <:pepe_omg:746842550530342912>`,
				embeds: [{ ...Common.emptyEmbed(), image: { url: image } }]
			}).catch(Common.discordErrorHandler);
		} else {
			await Common.simpleRequest("https://random-d.uk/api/random").then(data => {
				const image = JSON.parse(data).url;
				msg.channel.send(image).catch(Common.discordErrorHandler);
			}).catch(err => {
				msg.reply(`deu isso aqui de errado, ó: \`${err}\``).catch(Common.discordErrorHandler);
				Common.error(err);
			});
		}
	},
	aliases: ["duck", "pato"],
	syntaxes: [""],
	description: "Pega uma imagem aleatória de um pato. (feito por <@310480160640073729>)",
	help: "Pega uma imagem aleatória de um pato. (feito por <@310480160640073729>)",
	examples: [""],
	permissions: Permission.SHITPOST
}