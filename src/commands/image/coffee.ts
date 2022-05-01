import { Command, Argument, Permission } from "../index";
import { Message, MessageAttachment } from "discord.js";
import * as Common from "../../common";

const secrets: string[] = [
    "https://media.discordapp.net/attachments/532676259851927571/712827126696509520/alamo-img.jpg?width=887&height=499"
];

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (Math.random() < 0.001 && secrets.length) {
			const image = secrets[Math.floor(Math.random() * secrets.length)];

			msg.channel.send({
				content: `${msg.author} Você encontrou o café secreto <:pepe_omg:746842550530342912>`,
				embeds: [{ ...Common.emptyEmbed(), image: { url: image } }]
			}).catch(Common.discordErrorHandler);
		} else {
			Common.simpleRequest("https://coffee.alexflipnote.dev/random.json").then(data => {
				const image = JSON.parse(data).file;
				msg.channel.send(image);
			}).catch(err => {
				msg.reply(`deu isso aqui de errado, ó: \`${err}\``);
				Common.error(err);
			});
		}
	},
	aliases: ["cafe", "coffee"],
	syntaxes: [""],
	description: "Pega uma imagem aleatória de um café. (feito por <@310480160640073729>)",
	help: "Pega uma imagem aleatória de um café. (feito por <@310480160640073729>)",
	examples: [""],
	permissions: Permission.SHITPOST
}