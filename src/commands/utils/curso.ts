import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

const links: any = {
	"330403904992837632": "https://go.hotmart.com/Y17948280P",
	"338717274032701460": "https://go.hotmart.com/V17855634L",
	"454330688267878401": "https://go.hotmart.com/E39119891D",
	"194463676558737408": "https://go.hotmart.com/Q31250063W",
	"366993075513589771": "https://go.hotmart.com/J70404800U"
};

export default <Command>{
	async run(msg: Message<true>, args: Argument[]) {
		let link = links[msg.author.id] ?? "https://go.hotmart.com/P17856163O";
		msg.channel.send(`${msg.author} ${link}`).catch(Common.discordErrorHandler);
	},
	syntaxes: [""],
	permissions: Permission.NONE,
	aliases: ["curso"],
	description: "Link do curso.",
	help: "Link do curso do NoNe.",
	examples: []
};
