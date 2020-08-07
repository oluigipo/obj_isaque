import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";

const links: any = {
	"330403904992837632": "https://go.hotmart.com/Y17948280P",
	"338717274032701460": "https://go.hotmart.com/V17855634L",
	"454330688267878401": "https://go.hotmart.com/E39119891D"
};

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		let link = links[msg.author.id] ?? "https://go.hotmart.com/P17856163O";
		msg.channel.send(`${msg.author} ${link}`);
	},
	permissions: Permission.None,
	aliases: ["curso"],
	shortHelp: "Link do curso.",
	longHelp: "Link do curso do NoNe.",
	example: `${Server.prefix}curso`
};