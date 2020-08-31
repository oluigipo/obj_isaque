import { Command, Arguments, Permission, imageFrom, discordErrorHandler, imageAsAttachment, allowedImage } from "../../defs";
import { Message } from "discord.js";
import Jimp from "jimp";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		const img = imageFrom(msg, args);

		if (!img) {
			msg.reply("manda uma imagem po").catch(discordErrorHandler);
			return;
		}

		Jimp.read(img).then(image => {
			if (!allowedImage(image)) {
				msg.reply("essa imagem é muito grande").catch(discordErrorHandler);
				return;
			}

			const sharp = -4;

			image.quality(8)
				.convolute([[0, sharp, 0], [sharp, -sharp * 4 + 1, sharp], [0, sharp, 0]])
				.brightness(-0.25)
				.contrast(0.275)
				.getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
					if (err) {
						msg.reply("deu ruim").catch(discordErrorHandler);
						throw err; // raise
					}

					msg.channel.send(`${msg.author}`, imageAsAttachment(buffer, "jpg"));
				});
		});
	},
	aliases: ["deepfry"],
	syntaxes: ["[link | attachment]"],
	description: "Faz um DeepFry de uma imagem.",
	help: "Faz um DeepFry de uma imagem.",
	examples: [""],
	permissions: Permission.SHITPOST
}