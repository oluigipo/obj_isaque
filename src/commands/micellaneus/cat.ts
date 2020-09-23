// 
import { Command, Arguments, Permission, emptyEmbed, discordErrorHandler } from "../../defs";
import { Message, MessageAttachment } from "discord.js";
import request from "request";

const secrets = [
	"https://media.discordapp.net/attachments/431273314049327104/732632910380793987/izjr3ZWHr-QAtIZvlhg4dwBOgYFNDybZ-AKZFzDRFdE.png",
];

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (Math.random() < 0.001) {
			const image = secrets[Math.floor(Math.random() * secrets.length)];

			msg.reply(`Você encontrou o gato secreto <:pepe_omg:746842550530342912>`, emptyEmbed().setImage(image))
				.catch(discordErrorHandler);
		} else {
			request("https://aws.random.cat/meow", { json: true }, (err, res, body) => {
				if (err) {
					msg.reply("deu isso aqui de errado, ó: `${err}`");
					console.log(err);
					return;
				}

				const image = body.file;
				msg.channel.send(image);
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