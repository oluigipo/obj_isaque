import { Command, Arguments, CommonMessages, Server } from "../../definitions";
import cmds from "../index";
import { Message } from "discord.js";
import Moderation from "../../Moderation";

export default <Command>{
    run: (msg: Message, args: Arguments) => {
        let final: string;
        let isAdm = Moderation.isAdmin(msg.member) || msg.member.hasPermission("ADMINISTRATOR");

        if (args.length > 1) { // !!help comando
            let command = cmds.find((v: Command) => v.aliases.includes(args[1]));
            if (command === undefined) {
                msg.channel.send(`${msg.author} Este comando não existe.`);
                return;
            }

            final = `${msg.author} ${command.staff ? "(Staff Only) " : ""}`;
            if (command.aliases.length > 1) {
                final += `Aliases: \`${command.aliases.join(', ')}\`. `;
            }
            final += command.longHelp + ". ";
            final += `Exemplo: \`\`\`${command.example}\`\`\``;
        } else { // !!help
            let size = 0;
            for (let i = 0; i < cmds.length; i++) {
                if (size < cmds[i].aliases[0].length) size = cmds[i].aliases[0].length;
            }
            ++size;

            final = "```markdown\n";
            for (let i = 0; i < cmds.length; i++) {
                let cmd = cmds[i];
                if (cmd.staff && !isAdm) continue;
                final += `< ${cmd.aliases[0]} >${' '.repeat(size - cmd.aliases[0].length)}${cmd.shortHelp}.\n`; // ${cmd.staff ? " (Staff Only)" : ""}
            }
            final += "\n```";
        }

        msg.channel.send(final);
    },
    staff: false,
    aliases: ["help", "ajuda"],
    shortHelp: "Helpa aqui!",
    longHelp: "HEEEELP",
    example: `${Server.prefix}help\n${Server.prefix}help comando`
};