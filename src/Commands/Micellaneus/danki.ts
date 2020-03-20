import { Command, Arguments, Server, CommonMessages, Permission } from "../../definitions";
import { Message, TextChannel, RichEmbed } from "discord.js";

const images = [
	"https://cdn.discordapp.com/attachments/553933292542361601/633732233156362270/Danki_Boude.png",
	"https://cdn.discordapp.com/attachments/553933292542361601/633732285547544605/gamedev.png",
	"https://media.tenor.com/images/58d83a905a4fad6d2851f93e1c5b4851/tenor.gif",
	"https://media.tenor.com/images/ecf2f98818f6f9520a8e38a2cb7cb143/tenor.gif",
	"https://cdn.discordapp.com/attachments/507551338616586264/641328025488588800/sanfjasfjasf-1.gif",
	"https://media.discordapp.net/attachments/507551338616586264/615291066056179712/aaa.gif",
	"https://cdn.discordapp.com/attachments/507550989629521924/668598675890634752/dankitetris.gif"
];
let dankiImageCurrent = 0;

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		dankiImageCurrent = (dankiImageCurrent + 1) % images.length;

		let final = new RichEmbed();
		final.image = { url: images[dankiImageCurrent] };
		final.color = Server.botcolor;
		final.author = { name: msg.member.displayName, icon_url: msg.author.avatarURL };
		final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };

		msg.channel.send(final);
	},
	permissions: Permission.Shitpost,
	aliases: ["danki"],
	shortHelp: "Envia um meme da danki",
	longHelp: "Envia um meme da danki",
	example: `${Server.prefix}danki`
};
