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
			if (m.kickable) {
				m.kick();
				msg.channel.send(`O usuário ${m.user.tag} foi kickado.`).catch(console.error);
			} else {
				msg.channel.send(`Não é possível kickar o usuário ${m.user.tag}.`).catch(console.error);
			}
		});
	},
	permissions: Permission.Staff,
	aliases: ["kick"],
	shortHelp: "Kickar usuários",
	longHelp: "Kicka um ou mais usuários do servidor",
	example: `${Server.prefix}kick @user\n${Server.prefix}kick @user1 @user2...`
};