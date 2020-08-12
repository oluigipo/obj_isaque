// @NOTE(luigi): not checked

import { Command, Arguments, Server, Permission, discordErrorHandler } from "../../defs";
import { Message, TextChannel } from "discord.js";

export default <Command>{
	async run(msg: Message, _: Arguments, args: string[]) {
		if (!msg.guild || !msg.member) {
			return;
		}
		if (args.length < 2) {
			msg.reply("qual emoji e´ pra mandar?");
			return;
		}

		let qnt = 1;
		if (args.length > 2 && Number(args[2]) !== NaN)
			qnt = Math.max(Math.min(Number(args[2]), 68), 1);

		const e = msg.guild.emojis.cache.find(a => a.name === args[1]);
		if (e === null || e === undefined) {
			msg.channel.send(`O emoji \`${args[1]}\` é inválido.`);
			return;
		}

		let name = msg.member.displayName;
		if (msg.author.id === "338717274032701460" /* ID do luxuria */) name = "raquel";
		const image = msg.author.avatarURL() ?? "https://cdn.discordapp.com/attachments/431273314049327104/743175664798007367/unknown.png";

		let channel = <TextChannel>msg.channel;
		channel.fetchWebhooks()
			.then(async w => {
				let ww = w.first();
				if (!ww)
					ww = await channel.createWebhook("emoji");

				ww.send(`${e.toString()}`.repeat(qnt), { avatarURL: image, username: name }).catch(discordErrorHandler);;
			}).catch(discordErrorHandler);

		msg.delete().catch(discordErrorHandler);;
	},
	syntaxes: ["<emoji> [qnt = 1]"],
	permissions: Permission.NONE,
	aliases: ["emoji"],
	description: "Envia um emoji por ti",
	help: "Envia um emoji por ti usando webhooks (Número máximo de emojis por comando: 68)",
	examples: [`${Server.prefix}emoji kappa`, `${Server.prefix}emoji jotaro 5`]
};