import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message } from "discord.js";

const links: any = {

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