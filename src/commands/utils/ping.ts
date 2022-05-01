import { Command, Argument, Permission, InteractionOptionType } from "../index";
import Discord from "discord.js";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Discord.Message, args: Argument[]) {
		const m = await msg.channel.send("...").catch(Common.discordErrorHandler);
		if (!m)
			return;
		m.edit(`\`Bot Latency:\` ${m.createdTimestamp - msg.createdTimestamp}ms\n\`API Latency:\` ${Math.round(msg.client.ws.ping)}ms`)
			.catch(Common.discordErrorHandler);
	},
	syntaxes: [""],
	permissions: Permission.NONE,
	aliases: ["ping", "pong"],
	description: "Ping!",
	help: "Pong!",
	examples: [],
	
	interaction: {
		async run(int: Discord.CommandInteraction) {
			let text: string | undefined = undefined;
			if (int.options.data.length > 0 && int.options.data[0].name === "texto") {
				text = <any>int.options.data[0].value;
			}
			
			const m = <Discord.Message><unknown>await int.reply({ content: "...", fetchReply: true }).catch(Common.discordErrorHandler);
			if (!m)
				return;
			
			let finalText = "";
			
			finalText += `\`Bot Latency:\` ${m.createdTimestamp - int.createdTimestamp}ms`;
			finalText += `\n\`API Latency:\` ${Math.round(int.client.ws.ping)}ms`;
			if (text)
				finalText += `\nTexto: \`${text}\``;
			
			int.editReply(finalText).catch(Common.discordErrorHandler);
		},
		options: [
			{ type: InteractionOptionType.STRING, name: "texto", description: "pra enviar de volta", required: false },
		],
	},
};
