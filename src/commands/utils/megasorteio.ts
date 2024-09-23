import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message, User, MessageReaction, Role, APIEmbed, EmbedType } from "discord.js";
import * as Giveaway from "../../giveaway";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Message<true>, args: Argument[]) {
		if (args.length < 4) {
			msg.reply(`Informações insuficientes! \`${Common.SERVER.prefix}megasorteio <tempo> <quantidade> <prêmio>\``).catch(Common.discordErrorHandler);
			return;
		}
		args.shift();

		let role: Role | undefined;
		if (args[0].kind == ArgumentKind.ROLE) {
			role = args[0].value;
			args.shift();
		}

		if (args[0].kind !== ArgumentKind.TIME) {
			msg.reply(`${args[0].value.toString()} não serve. Me diga um tempo válido`).catch(Common.discordErrorHandler);
			return;
		}
		const duration = args[0].value;

		if (args[1].kind !== ArgumentKind.NUMBER) {
			msg.reply(`me diz a quantidade de vencedores que vai ter, mesmo que seja só 1`).catch(Common.discordErrorHandler);
			return;
		}
		const qnt = args[1].value;

		const premio = args.slice(2).reduce((arr, arg) => (arr.push(arg.value.toString()), arr), <string[]>[]).join(' ');
		
		const optional = (cond: boolean, x: any) => cond ? [x] : [];

		let final: APIEmbed = {
			type: EmbedType.Rich,
			color: Common.SERVER.botColor,
			author: msg.member ? { name: msg.member.displayName, icon_url: msg.member.user?.avatarURL() ?? undefined } : undefined,
			footer: { text: msg.client.user?.username, icon_url: msg.client.user?.avatarURL() ?? undefined },
			title: "MegaSorteio!",
			description: `Para participar, reaja com ${Common.EMOJIS.yes} nessa mensagem!`,
			fields: [
				...optional(role !== undefined, { name: "IMPORTANTE", value: `Apenas membros com o cargo ${role} podem participar!`, inline: true }),
				{ name: "Prêmio", value: `${qnt} ${premio}`, inline: true },
				{ name: "Organizador(a)", value: msg.author.toString(), inline: true },
				{ name: "Duração", value: Common.formatTime(duration), inline: true },
			],
		};

		msg.channel.send({ content: "MegaSorteio!", embeds: [final] }).then((mess) => {
			mess.react(Common.EMOJIS.yes);

			Giveaway.createGiveaway(mess.id, duration, qnt, premio, role?.id, mess.channel.id);

			return;
		}).catch(Common.discordErrorHandler);
	},
	syntaxes: ["[cargo] <tempo> <quantidade> <prêmio...>"],
	permissions: Permission.MOD,
	aliases: ["megasorteio"],
	description: "Iniciar um Mega Sorteio!",
	help: "Um Mega Sorteio consiste em um Prêmio",
	examples: [`10m 5 abraços do gabe`]
};
