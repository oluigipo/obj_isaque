import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message<true>, args: Argument[]) {
		msg.channel.send(`https://cdn.discordapp.com/attachments/507552679946485770/558803280935780386/VID-20190319-WA0001_1.gif`)
			.catch(Common.discordErrorHandler);
	},
	syntaxes: [""],
	permissions: Permission.SHITPOST,
	aliases: ["sonbra", "screenshake"],
	description: "Sonbra e seu glorioso ScreenShake",
	help: "Sonbra e seu glorioso ScreenShake",
	examples: []
};