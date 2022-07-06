import { Command, Argument, Permission } from "../index";
import Discord, { Message } from "discord.js";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message, _: Argument[], args: string[]) {
		if (args.length < 2) {
			msg.channel.send("mande o nÃºmero do FAQ!").catch(Common.discordErrorHandler);
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
		let faqContent = `**FAQ ${faqNum}**\n` + faqMsg.content.replace(pattern, "");
		//@Isaque, @None
		const allowedMentions = ['457020706857943051', '&598647793040621568'];
		faqContent = Common.removeMentions(faqContent, <Discord.TextChannel>msg.channel, allowedMentions);
		//Common.log(faqMsg.content);

		let toEmbed: string[] = [];
		if (faqMsg.attachments) {
			faqMsg.attachments.forEach(embed => {
				toEmbed.push(embed.url);
			});
		}

		let final = {
			content: faqContent,
			files: []
		};
		if (toEmbed.length > 0) {
			toEmbed.forEach(embed => {
				final.files.push({
					//ignore ts error due to a type missing on discord-api-types
					// docs shows that string[] is a valid "files" type: https://discord.js.org/#/docs/discord.js/stable/class/TextChannel?scrollTo=send
					
					// @ts-ignore
					attachment: embed
				});
			});
		}
		//let final = { embeds: [first] };
		msg.channel.send(final).catch(Common.discordErrorHandler);
	},
	syntaxes: ["[comando] <numero>"],
	permissions: Permission.NONE,
	aliases: ["faq"],
	description: "manda como embed o FAQ especificado",
	help: "manda como embed o FAQ especificado (!!faq n)",
	examples: ["!!faq 10 - manda a mensagem correspondente ao #faq 10"]
};
