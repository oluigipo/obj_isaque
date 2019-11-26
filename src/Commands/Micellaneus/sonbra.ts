
import { Command, Arguments, Server, CommonMessages } from "../../definitions";
import { Message, TextChannel } from "discord.js";

export default <Command>{
    run: (msg: Message, args: Arguments): void => {
        msg.channel.send(`https://cdn.discordapp.com/attachments/507552679946485770/558803280935780386/VID-20190319-WA0001_1.gif`);
    },
    staff: false,
    aliases: ["sonbra", "screenshake"],
    shortHelp: "Sonbra e seu glorioso ScreenShake",
    longHelp: "Sonbra e seu glorioso ScreenShake",
    example: `${Server.prefix}sonbra`
};