import { Command, Arguments, Server, Permission, Emojis, CommonMessages } from "../../definitions";
import { Message, User } from "discord.js";
import { getCompany, getUser, companyInvite } from "../../Shop";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 3) {
			msg.channel.send(`${msg.author} ${CommonMessages.syntaxError}`);
			return;
		}
		const user = getUser(msg.author.id);
		if (user === void 0) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} Você não tem uma lojinha!`);
			return;
		}
		const comp = getCompany(user);
		if (comp === void 0) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} Você não está em uma empresa!`);
			return;
		}

		const invited = <User | undefined>msg.mentions.users.first() ?? 0;
		if (invited === 0) {
			msg.channel.send(`${Emojis.no} **|** ${msg.author} Usuário inválido!`);
			return;
		}
		const result = companyInvite(comp, invited.id);

		if (!result.success) msg.channel.send(result.reason.replace('#', `${msg.author}`));
		else msg.channel.send(`${Emojis.yes} **|** A lojinha **${result.extra}** foi convidada! ${invited}, use \`${Server.prefix}shop join\` para aceitar o convite!`);
	},
	permissions: Permission.None,
	aliases: ["invite"],
	shortHelp: "Convide um usuário para a sua empresa!",
	longHelp: "Convide um usuário para a sua empresa!",
	example: `${Server.prefix}shop invite @user`
};