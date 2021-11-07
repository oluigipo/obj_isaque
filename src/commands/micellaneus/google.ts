import { Command, Arguments, Permission, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		raw.shift();
		let term = raw.join(" ");

		if (term === "") {
			msg.channel.send("pesquisar o quê?").catch(discordErrorHandler);
		} else {
			let uri = encodeURI(`https://google.com/search?q=${term}`);

			msg.channel.send(uri).catch(discordErrorHandler);
		}
	},
	aliases: ["google"],
	syntaxes: ["<search...>"],
	description: "Let me google that for you",
	help: "Let me google that for you",
	examples: ["google"],
	permissions: Permission.NONE
}