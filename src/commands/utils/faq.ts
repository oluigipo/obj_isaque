import { Command, Argument, Permission } from "../index";
import Discord, { Message } from "discord.js";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, _: Argument[], args: string[]) {
		if (args.length < 2) {
			msg.channel.send("mande o número do FAQ!").catch(Common.discordErrorHandler);
			return;
		}

		let faqNum = parseInt(args[1]);
		if (isNaN(faqNum) || !isFinite(faqNum)) {
			msg.channel.send("FAQ inexistente !").catch(Common.discordErrorHandler);
			return;
		}

		let faqChannel = <Discord.TextChannel>await Common.client.channels.fetch(Common.CHANNELS.faq).catch(Common.discordErrorHandler);
		let messages = await faqChannel.messages.fetch();
		if(!messages){
			msg.channel.send("FAQ inexistente !").catch(Common.discordErrorHandler);
			return;
		}
		
		let faqMsg = messages.at((messages.size-1)-(faqNum-1));
		if(!faqMsg){
			msg.channel.send("FAQ inexistente !").catch(Common.discordErrorHandler);
			return;
		}
		
		const pattern = /\**[Ff]aq ?\d+\**:?\**\s*/;
		const faqContent = faqMsg.content.replace(pattern, "");
		//Common.log(faqMsg.content);

		let final = Common.defaultEmbed(Common.notNull(msg.member));
		final.title = `FAQ ${faqNum}`;
		final.description = faqContent;
		
		msg.channel.send({ embeds: [final] }).catch(Common.discordErrorHandler);
	},
	syntaxes: ["[comando] <numero>"],
	permissions: Permission.SHITPOST,
	aliases: ["faq"],
	description: "manda como embed o FAQ especificado",
	help: "manda como embed o FAQ especificado (!!faq n)",
	examples: ["!!faq 10 - manda a mensagem correspondente ao #faq 10"]
};
