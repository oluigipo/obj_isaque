// @NOTE(luigi): not checked

import { Command, Arguments, Server, Permission, discordErrorHandler } from "../../defs";
import { Message, TextChannel, Webhook } from "discord.js";
import * as Balance from "../../balance";

export default <Command>{
	async run(msg: Message, _: Arguments, args: string[]) {
		if (!msg.guild || !msg.member) {
			return;
		}
		if (args.length < 2) {
			msg.reply("qual emoji e´ pra mandar?")
				.catch(discordErrorHandler);
			return;
		}

		let qnt = 1;
		if (args.length > 2 && Number(args[2]) !== NaN)
			qnt = Math.max(Math.min(Number(args[2]), 68), 1);

		const e = msg.client.emojis.cache.find(a => a.name === args[1]);
		if (e === null || e === undefined) {
			msg.channel.send(`O emoji \`${args[1]}\` é inválido.`)
				.catch(discordErrorHandler);
			return;
		}

		if (e.animated && !msg.member.permissions.has("ADMINISTRATOR")) {
			const r = Balance.buy(msg.author.id, 10);

			if (!r.success || !r.data) {
				msg.reply(`agora custa \`$10\` para usar emoji animado... você não tem \`$10\``).catch(discordErrorHandler);
				return;
			}

			Balance.updateDB();
		}

		let name = msg.member.displayName;
		if (msg.author.id === "338717274032701460" /* ID do luxuria */) name = "raquel";
		const image = msg.author.avatarURL() ?? Server.defaultImage;

		let channel = <TextChannel>msg.channel;
		channel.fetchWebhooks()
			.then(async w => {
				let ww = w.first();
				if (!ww)
					ww = <Webhook>await channel.createWebhook("emoji").catch(discordErrorHandler);

				let text = `${e.toString()}`.repeat(qnt);
				if (text.length > 2000)
					text = `\\*tantos ${e.toString()} que quebra o limite do discord\\*`;

				ww.send(text, { avatarURL: image, username: name }).catch(discordErrorHandler);;
			}).catch(discordErrorHandler);

		msg.delete().catch(discordErrorHandler);;
	},
	syntaxes: ["<emoji> [qnt = 1]"],
	permissions: Permission.NONE,
	aliases: ["emoji"],
	description: "Envia um emoji por ti",
	help: "Envia um emoji por ti usando webhooks (Número máximo de emojis por comando: 68)",
	examples: [`kappa`, `jotaro 5`, "peepo_surrender"]
};