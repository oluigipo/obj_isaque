import { Command, Arguments, Server, CommonMessages, Permission } from "../../definitions";
import { Message, TextChannel } from "discord.js";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 2) {
			msg.channel.send(CommonMessages.syntaxError);
			return;
		}

		let qnt = 1;
		if (args.length > 2 && Number(args[2]) !== NaN)
			qnt = Math.max(Math.min(Number(args[2]), 68), 1);

		const e = msg.guild.emojis.find(a => a.name === args[1]);
		if (e === null || e === undefined) {
			msg.channel.send(`O emoji \`${args[1]}\` é inválido.`);
			return;
		}

		let name = msg.member.nickname === null ? msg.author.username : msg.member.nickname;
		if (msg.author.id === "338717274032701460" /* ID do luxuria */) name = "raquel";
		const image = msg.author.avatarURL;

		let channel = <TextChannel>msg.channel;
		channel.createWebhook(name, image)
			.then(w => {
				w.send(`${e}`.repeat(qnt)).then(() => w.delete())
			}).catch(a => msg.channel.send(a));

		msg.delete();
	},
	permissions: Permission.None,
	aliases: ["emoji"],
	shortHelp: "Envia um emoji por ti",
	longHelp: "Envia um emoji por ti usando webhooks (Número máximo de emojis por comando: 68)",
	example: `${Server.prefix}emoji kappa\n${Server.prefix}emoji jotaro 5`
};