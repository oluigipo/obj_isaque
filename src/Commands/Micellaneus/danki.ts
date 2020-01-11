import { Command, Arguments, Server, CommonMessages, Permission } from "../../definitions";
import { Message, TextChannel } from "discord.js";

const images: string[] = [
	"https://cdn.discordapp.com/attachments/553933292542361601/633732233156362270/Danki_Boude.png",
	"https://cdn.discordapp.com/attachments/553933292542361601/633732285547544605/gamedev.png",
	"https://tenor.com/view/danki-danki-code-danki-cry-curso-danki-gif-15268437",
	"https://tenor.com/view/danki-dankicode-gif-15270906"
];
let dankiImageCurrent = 0;

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		dankiImageCurrent = (dankiImageCurrent + 1) % images.length;

		msg.channel.send(`${msg.author} ${images[dankiImageCurrent]}`);
	},
	permissions: Permission.Shitpost,
	aliases: ["danki"],
	shortHelp: "Envia um meme da danki",
	longHelp: "Envia um meme da danki",
	example: `${Server.prefix}danki`
};