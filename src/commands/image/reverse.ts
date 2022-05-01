import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message } from "discord.js";
import Jimp from "jimp";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		let img: string | Jimp | undefined = Common.imageFrom(msg, args);

		if (!img) {
			msg.reply("manda uma imagem po").catch(Common.discordErrorHandler);
			return;
		}

		Common.processImage(img, (image: Jimp) => {
			(raw[0] === "reverse" ? image.rotate(180) : image.flip(true, false))
				.getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
					if (err) {
						Common.error(err);
						msg.reply("deu ruim");
						return;
					}

					msg.channel.send({
						content: `${msg.author} olha`,
						...Common.imageAsAttachment(buffer, "jpg")
					}).catch(Common.discordErrorHandler);
				});
		}).catch(err => {
			Common.error(err);
			msg.reply("tem certeza que isso é uma imagem?").catch(Common.discordErrorHandler);
		});
	},
	aliases: ["reverse", "mirror"],
	syntaxes: ["[link | attachment]"],
	description: "Inverte uma imagem",
	help: "Inverte uma imagem",
	examples: ["https://algum.link/para/imagem.png"],
	permissions: Permission.SHITPOST
}