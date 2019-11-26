import { Command, Arguments, Server, CommonMessages } from "../../definitions";
import { Message } from "discord.js";

export default <Command>{
    run: (msg: Message, args: Arguments): void => {
        if (!(msg.author.id === "373670846792990720" || msg.author.id === "330403904992837632"))
            return;
        if (args.length < 2) {
            msg.channel.send(CommonMessages.syntaxError);
            return;
        }
        const cmd = args.slice(1, args.length).join(' ');
        let result;
        try {
            result = eval(cmd);
        }
        catch (e) {
            result = e;
        }
        msg.channel.send(String(result));
    },
    staff: true,
    aliases: ["eval"],
    shortHelp: "eval",
    longHelp: "quer saber por quê??",
    example: `${Server.prefix}eval comando`
};