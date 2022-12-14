import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

const secrets = [
	"https://media.discordapp.net/attachments/431273314049327104/732632910380793987/izjr3ZWHr-QAtIZvlhg4dwBOgYFNDybZ-AKZFzDRFdE.png",
];

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (Math.random() < 0.001) {
			const image = secrets[Math.floor(Math.random() * secrets.length)];

			msg.channel.send({
				content: `${msg.author} Você encontrou o gato secreto <:pepe_omg:746842550530342912>`,
				embeds: [{ ...Common.emptyEmbed(), image: { url: image } }]
			}).catch(Common.discordErrorHandler);
		} else {
			await Common.simpleRequest("https://aws.random.cat/meow").then(data => {
				const image = JSON.parse(data).file;
				msg.channel.send(image).catch(Common.discordErrorHandler);
			}).catch(err => {
				msg.reply(`deu isso aqui de errado, ó: \`${err}\``).catch(Common.discordErrorHandler);
				Common.error(err);
			});
		}
	},
	aliases: ["cat", "gato"],
	syntaxes: [""],
	description: "Pega uma imagem aleatória de um gato. (roubado do <@333813363824132098>)",
	help: "Pega uma imagem aleatória de um gato. (roubado do <@333813363824132098>)",
	examples: [""],
	permissions: Permission.SHITPOST
}
