import { Command, Arguments, Server, Permission, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";

const links: any = {
	"330403904992837632": "https://go.hotmart.com/Y17948280P",
	"338717274032701460": "https://go.hotmart.com/V17855634L",
	"454330688267878401": "https://go.hotmart.com/E39119891D"
};

export default <Command>{
	async run(msg: Message, args: Arguments) {
		let link = links[msg.author.id] ?? "https://go.hotmart.com/P17856163O";
		msg.channel.send(`<@${msg.author}> ${link}`)
			.catch(discordErrorHandler);
	},
	syntaxes: [""],
	permissions: Permission.NONE,
	aliases: ["curso"],
	description: "Link do curso.",
	help: "Link do curso do NoNe.",
	examples: []
};