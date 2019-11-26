import { Command, Arguments, CommonMessages, Server } from "../../definitions";
import Moderation from "../../Moderation";
import { Message } from "discord.js";

export default <Command>{
    run: (msg: Message, args: Arguments) => {
        if (args.length < 2) {
            msg.channel.send(CommonMessages.syntaxError);
            return;
        }

        msg.mentions.members.forEach(m => {
            let result = Moderation.unmute(msg.client, m.user.id);
            if (result) {
                msg.channel.send(`O usuário ${m.user.tag} foi desmutado com sucesso.`);
            } else {
                msg.channel.send(`O usuário ${m.user.tag} não está mutado ou tem algo de errado...`);
            }
        });
    },
    aliases: ["unmute"],
    longHelp: "Desmuta um ou mais usuários no servidor",
    shortHelp: "Desmutar usuários",
    example: `${Server.prefix}unmute @user\n${Server.prefix}unmute @user1 @user2...`,
    staff: true
};