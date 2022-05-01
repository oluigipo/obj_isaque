import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import Jimp from "jimp";
import * as Common from "../../common";

const size = 128;
const sizeMul = 2;
const rendaSize = 96;
const maxLength = 100;
const margin = 5;

let rendaImage: Jimp;
Jimp.read("https://cdn.discordapp.com/emojis/551130874750566401.png")
	.then(image => rendaImage = image.resize(rendaSize, rendaSize))
	.catch(Common.discordErrorHandler);

let defaultFontWhite: any;
let defaultFontBlack: any;

Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(fnt => defaultFontWhite = fnt);
Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(fnt => defaultFontBlack = fnt);

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (raw.length < 2) {
			msg.reply("o que ele deve dizer?").catch(Common.discordErrorHandler);
			return;
		}

		const text = raw.slice(1).join(' ');
		if (text.length > maxLength) {
			msg.reply(`esse texto é muito grande (o limite é ${maxLength} caracteres)`).catch(Common.discordErrorHandler);
			return;
		}

		const largestWord = raw.reduce((acc, w) => Math.max(acc, w.length), 0);
		const thisSize = size + Math.max(text.length * sizeMul, largestWord * sizeMul * 2);
		if (thisSize >= 500) {
			msg.reply("a imagem ficou muito grande").catch(Common.discordErrorHandler);
			return;
		}

		Common.processImage(new Jimp(thisSize, thisSize), image => {
			if (!Common.allowedImage(image)) {
				msg.reply("essa imagem é muito grande").catch(Common.discordErrorHandler);
				return;
			}

			image.blit(rendaImage, thisSize - rendaSize, thisSize - rendaSize)
				.print(defaultFontBlack, 7, 7, text, thisSize - margin, thisSize - margin)
				.print(defaultFontWhite, 5, 5, text, thisSize - margin, thisSize - margin)
				.getBuffer(image.getMIME(), (err, buffer) => {
					if (err) {
						Common.error(err);
						msg.reply("deu ruim").catch(Common.discordErrorHandler);
						return;
					}

					msg.channel.send({
						content: `${msg.author}`,
						...Common.imageAsAttachment(buffer, image.getExtension())
					}).catch(Common.discordErrorHandler);
				});
		}).catch(err => {
			msg.reply("deu ruim").catch(Common.discordErrorHandler);
			Common.error(err);
		});
	},
	aliases: ["renda"],
	syntaxes: ["[texto]"],
	description: "O que o renda vai dizer?",
	help: `Manda uma imagem do renda dizendo o texto fornecido. O limite do texto é ${maxLength} caracteres`,
	examples: ["tao com medo?"],
	permissions: Permission.SHITPOST
}