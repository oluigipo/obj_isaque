import { Command, Arguments, Server } from "../../definitions";
import { Message } from "discord.js";

export default <Command>{
    run: async (msg: Message, args: Arguments) => {
        const m = await <Promise<Message>>msg.channel.send("...");
        m.edit(`\`Bot Latency:\` ${m.createdTimestamp - msg.createdTimestamp}ms\n\`API Latency:\` ${Math.round(msg.client.ping)}ms`);
    },
    staff: false,
    aliases: ["ping", "pong"],
    shortHelp: "Ping!",
    longHelp: "Pong!",
    example: `${Server.prefix}ping`
};