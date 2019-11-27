import { Command, Arguments, Server, Channels } from "../../definitions";
import { Message } from "discord.js";
export default <Command>{
    run: (msg: Message, args: Arguments): void => {
        if (msg.channel.id !== Channels.shitpost) return;
        msg.channel.send(`ULO${'O'.repeat(Math.floor(Math.random() * 201))}N`);
    },
    staff: false,
    aliases: ["ulon"],
    shortHelp: "ULOOOOON",
    longHelp: "ULOOOOOOOOOOOOOOOOOON",
    example: `${Server.prefix}ulon`
};