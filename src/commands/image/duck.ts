import { Command, Arguments, Permission, emptyEmbed, discordErrorHandler } from "../../defs";
import { Message, MessageAttachment } from "discord.js";
import request from "request";

const secrets: string[] = [];

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (Math.random() < 0.001 && secrets.length) {
			const image = secrets[Math.floor(Math.random() * secrets.length)];

			msg.reply(`Você encontrou o pato secreto <:pepe_omg:746842550530342912>`, emptyEmbed().setImage(image))
				.catch(discordErrorHandler);
		} else {
			request("https://random-d.uk/api/random", { json: true }, (err, res, body) => {
				if (err) {
					msg.reply("deu isso aqui de errado, ó: `${err}`");
					console.log(err);
					return;
				}

				const image = body.url;
				msg.channel.send(image);
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