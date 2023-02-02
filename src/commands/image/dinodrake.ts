import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import Jimp from "jimp";
import * as Common from "../../common";

let dino_drake: Jimp;
Jimp.read("https://media.discordapp.net/attachments/723581427391791104/761242780021424158/dinodrake.png")
	.then(i => dino_drake = i)
	.catch(Common.error);

const emoji_re = /<a?:[\w_]+:(\d{18}\d*)>/;
const user_re = /^<@!?(\d{18}\d*)>$/;
const userid_re = /^(\d{18}\d*)$/;

async function resolve_image(this: any, arg: string): Promise<Jimp> {
	let match;
	if (match = emoji_re.exec(arg)) {
		return Jimp.read(`https://cdn.discordapp.com/emojis/${match[1]}.png`)
	} else if ((match = user_re.exec(arg)) || (match = userid_re.exec(arg))) {
		return Jimp.read(this.client.users.resolve(match[1])?.displayAvatarURL({ size: 128, format: 'png' }) ?? `https://cdn.discordapp.com/emojis/730239159066689649.png`)
	} else {
		if (!arg.match(/(\.jpeg|\.jpg|\.png|\.bmp|\.tiff|\.gif)(\?.*)?$/))
			throw { kind: "BadFormat", reason: "link precisa ser .jpeg | .png | .bmp | .tiff | .gif" };
		return Jimp.read(arg)
	}
}

export default <Command>{
	async run(msg: Message, _: Argument[], raw: string[]) {
		if (raw.length < 3) {
			msg.reply("Mande dois usuarios, emojis ou links para fazer o meme").catch(Common.discordErrorHandler);
			return;
		}
		msg.suppressEmbeds();
		const args = raw.slice(1, 3);

		Promise.all(args.map(resolve_image, msg))
			.then(([img1, img2]) => {
				dino_drake.clone()
					.blit(img1.resize(128, 128), 0, 0)
					.blit(img2.resize(128, 128), 0, 128)
					.getBuffer(dino_drake.getMIME(), (err, buffer) => {
						if (err) {
							Common.error(err);
							msg.reply("deu ruim").catch(Common.discordErrorHandler);
							return;
						}

						msg.channel.send({
							content: `${msg.author}`,
							...Common.imageAsAttachment(buffer, `png`)
						}).catch(Common.discordErrorHandler);
					});
			})
			.catch(err => {
				if (err.kind == "BadFormat")
					return msg.reply(err.reason).catch(Common.discordErrorHandler);
				msg.reply("deu ruim").catch(Common.discordErrorHandler);
				Common.error(err);
			});
	},
	aliases: ["dinodrake"],
	syntaxes: ["[user|link|emoji] [user|link|emoji]"],
	description: "Faça um meme com o Dino, feito por <@310480160640073729>",
	help: `Manda um meme do Dino Drake com duas imagens. Feito por <@310480160640073729>`,
	examples: [],
	permissions: Permission.SHITPOST
}
