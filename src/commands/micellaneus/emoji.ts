import { Command, Argument, Permission, ArgumentKind } from "../index";
import Discord from "discord.js";
import * as Balance from "../../balance";
import * as stringSimilarity from 'string-similarity';
import * as Common from "../../common";

export default <Command>{
	async run(msg: Discord.Message, _: Argument[], args: string[]) {
		if (!msg.guild || !msg.member) {
			return;
		}
		if (args.length < 2) {
			msg.reply("qual emoji é pra mandar?").catch(Common.discordErrorHandler);
			return;
		}

		let qnt = 1;
		if (args.length > 2 && !isNaN(qnt = Number(args[2])))
			qnt = Math.max(Math.min(qnt, 68), 1);

		let e_ = msg.client.emojis.cache.find(a => a.name === args[1]);
		if (e_ === null || e_ === undefined) {
			const sim_array: Discord.GuildEmoji[] = [];
			const name_array = <string[]>msg.client.emojis.cache.map(a => (sim_array.push(a),a.name)).filter(a => a !== null);

			const best = stringSimilarity.findBestMatch(args[1], name_array);

			const sent_msg = await msg.channel.send(`O emoji \`${args[1]}\` é inválido. Você quis dizer \`${best.bestMatch.target}\`?`)
				.catch(Common.discordErrorHandler);
			
			if (!sent_msg) return;

			sent_msg.react('👍')
			const confirmed = await sent_msg
				.awaitReactions({
					max: 1, time: 60000, errors: ['time'],
					filter: (reaction: Discord.MessageReaction, user: Discord.User) => reaction.emoji.name == '👍'&& user.id === msg.author.id })
				.then(_ => {
					sent_msg.delete()
					return true
				})
				.catch(_ => false);

			if (confirmed) {
				e_ = sim_array[best.bestMatchIndex];
			} else {
				return;
			}
		}

		if (e_ === null || e_ === undefined) {
			msg.channel.send(`O emoji \`${args[1]}\` é inválido.`)
				.catch(Common.discordErrorHandler);
			return;
		}

		const e = e_;

		if (e.animated && !msg.member.permissions.has("ADMINISTRATOR")) {
			const r = Balance.buy(msg.author.id, 10);

			if (!r.ok || !r.data) {
				msg.reply(`agora custa \`$10\` para usar emoji animado... você não tem \`$10\``).catch(Common.discordErrorHandler);
				return;
			}

			Balance.updateDB();
		}

		let name = msg.member.displayName;
		if (msg.author.id === "338717274032701460" /* ID do luxuria */) name = "raquel";
		const image = msg.author.avatarURL() ?? Common.SERVER.defaultImage;

		// NOTE(ljre): Send It.
		let webhook: Discord.Webhook;
		let threadId: string | undefined;
		let channel: Discord.TextChannel | Discord.NewsChannel;

		if (msg.channel.isThread()) {
			threadId = msg.channel.id;
			channel = Common.notNull((<Discord.ThreadChannel>msg.channel).parent);
		} else {
			channel = <Discord.TextChannel>msg.channel;
		}

		channel.fetchWebhooks()
			.then(async w => {
				let ww = w.first();
				if (!ww)
					ww = <Discord.Webhook>await channel.createWebhook("emoji").catch(Common.discordErrorHandler);

				let text = `${e.toString()}`.repeat(qnt);
				if (text.length > 2000)
					text = `\\*tantos ${e.toString()} que quebra o limite do discord\\*`;

				ww.send({ content: `${e}`.repeat(qnt), avatarURL: image, username: name, threadId }).catch(Common.discordErrorHandler);;
			}).catch(Common.discordErrorHandler);

		msg.delete().catch(Common.discordErrorHandler);;
	},
	syntaxes: ["<emoji> [qnt = 1]"],
	permissions: Permission.NONE,
	aliases: ["emoji"],
	description: "Envia um emoji por ti",
	help: "Envia um emoji por ti usando webhooks (Número máximo de emojis por comando: 68)",
	examples: [`kappa`, `jotaro 5`, "peepo_surrender"]
};
