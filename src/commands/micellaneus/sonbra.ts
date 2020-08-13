import { Command, Arguments, Server, Permission, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments) {
		msg.channel.send(`https://cdn.discordapp.com/attachments/507552679946485770/558803280935780386/VID-20190319-WA0001_1.gif`)
			.catch(discordErrorHandler);
	},
	syntaxes: [""],
	permissions: Permission.SHITPOST,
	aliases: ["sonbra", "screenshake"],
	description: "Sonbra e seu glorioso ScreenShake",
	help: "Sonbra e seu glorioso ScreenShake",
	examples: []
};