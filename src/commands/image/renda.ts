import { Command, Arguments, Permission, discordErrorHandler, processImage, defaultErrorHandler, defaultFontBlack, defaultFontWhite, imageAsAttachment, allowedImage } from "../../defs";
import { Message } from "discord.js";
import Jimp from "jimp";

const size = 128;
const sizeMul = 2;
const rendaSize = 96;
const maxLength = 100;
const margin = 5;

let rendaImage: Jimp;
Jimp.read("https://cdn.discordapp.com/emojis/551130874750566401.png")
	.then(image => rendaImage = image.resize(rendaSize, rendaSize))
	.catch(discordErrorHandler);

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (raw.length < 2) {
			msg.reply("o que ele deve dizer?").catch(discordErrorHandler);
			return;
		}

		const text = raw.slice(1).join(' ');
		if (text.length > maxLength) {
			msg.reply(`esse texto é muito grande (o limite é ${maxLength} caracteres)`).catch(discordErrorHandler);
			return;
		}

		const largestWord = raw.reduce((acc, w) => Math.max(acc, w.length), 0);
		const thisSize = size + Math.max(text.length * sizeMul, largestWord * sizeMul * 2);
		if (thisSize >= 500) {
			msg.reply("a imagem ficou muito grande").catch(discordErrorHandler);
			return;
		}

		processImage(new Jimp(thisSize, thisSize), image => {
			if (!allowedImage(image)) {
				msg.reply("essa imagem é muito grande").catch(discordErrorHandler);
				return;
			}

			image.blit(rendaImage, thisSize - rendaSize, thisSize - rendaSize)
				.print(defaultFontBlack, 7, 7, text, thisSize - margin, thisSize - margin)
				.print(defaultFontWhite, 5, 5, text, thisSize - margin, thisSize - margin)
				.getBuffer(image.getMIME(), (err, buffer) => {
					if (err) {
						defaultErrorHandler(err);
						msg.reply("deu ruim").catch(discordErrorHandler);
						return;
					}

					msg.channel.send(`${msg.author}`, imageAsAttachment(buffer, image.getExtension()))
						.catch(discordErrorHandler);
				});
		}).catch(err => {
			msg.reply("deu ruim").catch(discordErrorHandler);
			defaultErrorHandler(err);
		});
	},
	aliases: ["renda"],
	syntaxes: ["[texto]"],
	description: "O que o renda vai dizer?",
	help: `Manda uma imagem do renda dizendo o texto fornecido. O limite do texto é ${maxLength} caracteres`,
	examples: ["tao com medo?"],
	permissions: Permission.SHITPOST
}