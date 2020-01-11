import { Command, Arguments, CommonMessages, Server, Permission } from "../../definitions";
import Moderation from "../../Moderation";
import { Message } from "discord.js";

export default <Command>{
	run: (msg: Message, args: Arguments) => {
		if (args.length < 2) {
			msg.channel.send(CommonMessages.syntaxError);
			return;
		}

		msg.mentions.members.forEach(m => {
			let result = Moderation.ban(msg.client, m.user.id);
			if (result) {
				msg.channel.send(`${msg.author} O usuário ${m.user.tag} foi banido com sucesso.`);
			} else {
				msg.channel.send(`${msg.author} O usuário ${m.user.tag} não pôde ser banido.`);
			}
		});
	},
	permissions: Permission.Staff,
	aliases: ["ban"],
	shortHelp: "Banir usuários",
	longHelp: "Bane um ou mais usuários do servidor",
	example: `${Server.prefix}ban @user\n${Server.prefix}ban @user1 @user2...`
};