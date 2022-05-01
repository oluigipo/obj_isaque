import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import Jimp from "jimp";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		const img = Common.imageFrom(msg, args);

		if (!img) {
			msg.reply("manda uma imagem po").catch(Common.discordErrorHandler);
			return;
		}

		Jimp.read(img).then(image => {
			if (!Common.allowedImage(image)) {
				msg.reply("essa imagem é muito grande").catch(Common.discordErrorHandler);
				return;
			}

			const sharp = -4;

			image.quality(8)
				.convolute([[0, sharp, 0], [sharp, -sharp * 4 + 1, sharp], [0, sharp, 0]])
				.brightness(-0.25)
				.contrast(0.275)
				.getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
					if (err) {
						msg.reply("deu ruim").catch(Common.discordErrorHandler);
						throw err; // raise
					}

					msg.channel.send({
						content: `${msg.author}`,
						...Common.imageAsAttachment(buffer, "jpg")
					}).catch(Common.discordErrorHandler);
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