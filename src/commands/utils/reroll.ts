import { Command, Argument, Permission, ArgumentKind } from "../index";
import Discord from "discord.js";
import * as Giveaway from "../../giveaway";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Discord.Message, args: Argument[]) {
		let role: Discord.Role | undefined;
		let qnt = 1;
		let msgid: string;
		
		if (args[1].kind === ArgumentKind.ROLE) {
			role = args[1].value;
			args.shift();
		}
		
		if (args[1].kind !== ArgumentKind.NUMBER)
			return msg.reply("preciso de um número válido de quantidade").catch(Common.discordErrorHandler);
		qnt = args[1].value;
		
		if (args[2].kind !== ArgumentKind.SNOWFLAKE)
			return msg.reply("preciso do ID da mensagem que vou pegar as reações").catch(Common.discordErrorHandler);
		msgid = args[2].value;
		
		// Copy-pasted from '/giveaway.ts'
		{
			const message = await msg.channel.messages.fetch(msgid);
			if (!message)
				return msg.reply("não consegui achar uma mensagem com esse ID nesse canal...").catch(Common.discordErrorHandler);
			
			const reaction = message.reactions.resolve(Common.EMOJIS.yes);
			if (!reaction)
				return msg.reply(`não consegui achar reações com o emoji ${Common.EMOJIS.yes}...`).catch(Common.discordErrorHandler);
		
			const users = await reaction.users.fetch().catch(Common.discordErrorHandler);
			if (!users)
				return msg.reply("não consegui dar fetch nos usuários das reações não 💀").catch(Common.discordErrorHandler);
			
			let member: Discord.GuildMember | undefined;
			const winners = users
				.filter(user => !user.bot && (member = msg.guild?.members.cache.get(user.id), member !== void 0))
				.random(qnt)
				.filter(user => user !== undefined); // why tf does .random add padding undefined????
		
			if (winners.length > 0) {
				let text = `Lista de vendedores:\n${winners.reduce((acc, val) => acc + `\n${val}`, "")}`;
		
				if (qnt > winners.length)
					text += `\n\nMas ainda sobrou ${qnt - winners.length} prêmio(s)!`;
		
				msg.channel.send(text).catch(Common.discordErrorHandler);
			} else {
				msg.channel.send("Poxa, ninguém ganhou :pensive:").catch(Common.discordErrorHandler);
			}
		}
	},
	syntaxes: ["[cargo] <quantidade> <id da mensagem no mesmo canal>"],
	permissions: Permission.MOD,
	aliases: ["reroll"],
	description: "Rolar os dados -- pega N pessoas aleatórias que reagiram a tal mensagem.",
	help: "Para quando o !!megasorteio não funcionar :clown:",
	examples: [`10m 5 abraços do gabe`]
};
