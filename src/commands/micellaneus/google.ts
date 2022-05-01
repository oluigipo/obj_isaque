import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		raw.shift();
		let term = raw.join(" ");

		if (term === "") {
			msg.channel.send("pesquisar o quê?").catch(Common.discordErrorHandler);
		} else {
			let uri = encodeURI(`https://google.com/search?q=${term}`);

			msg.channel.send(uri).catch(Common.discordErrorHandler);
		}
	},
	aliases: ["google"],
	syntaxes: ["<search...>"],
	description: "Let me google that for you",
	help: "Let me google that for you",
	examples: ["google"],
	permissions: Permission.NONE
}