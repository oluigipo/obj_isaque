import { Command, Arguments, CommonMessages, Server, Permission } from "../../definitions";
import cmds from "../index";
import { Message, RichEmbed } from "discord.js";
import Moderation from "../../Moderation";

function makeRGB(r: number, g: number, b: number): number {
	return (r << 16) | (g << 8) | (b);
}

export default <Command>{
	run: (msg: Message, args: Arguments) => {
		let pagesCount = Math.ceil(cmds.length / 10);
		let final = new RichEmbed();
		final.color = makeRGB(48, 162, 70);
		final.author = { name: (msg.member.nickname ? msg.member.nickname : msg.author.username), icon_url: msg.author.avatarURL };
		final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };
		let isAdm = Moderation.isAdmin(msg.member) || msg.member.hasPermission("ADMINISTRATOR");

		if (args.length > 1) { // !!help <algumaCoisa>
			let num = parseInt(args[1]);

			if (isNaN(num)) { // !!help comando
				let command = cmds.find((v: Command) => v.aliases.includes(args[1]));
				if (command === undefined) {
					msg.channel.send(`${msg.author} Este comando não existe.`);
					return;
				}

				final.title = `Comando: ${command.aliases[0]}${((command.permissions & Permission.Staff) ? " (Staff Only)" : "")}`;
				final.description = command.longHelp;
				if (command.aliases.length > 1) {
					final.addField("Aliases", `\`${command.aliases.join('`, `')}\``);
				}
				final.addField("Exemplo", command.example);
			} else { // !!help número
				if (num > pagesCount || num <= 0) {
					msg.channel.send(`${msg.author} Essa página não existe.`);
					return;
				}

				final.title = `Lista de comandos (${num}/${pagesCount})`;

				let count = 0;
				for (let i = (num - 1) * 10; count < 10; i++) {
					let cmd = cmds[i];
					if (cmd === undefined) break;
					if ((cmd.permissions & Permission.Staff) && !isAdm) continue;
					final.addField(cmd.aliases[0], cmd.shortHelp);
					++count;
				}
			}
		} else { // !!help
			final.title = `Lista de comandos (1/${pagesCount})`;
			final.description = `Dica: você pode usar \`${Server.prefix}help númeroDaPágina\` para ver mais comandos!`;
			let count = 0;
			for (let i = 0; count < 10; i++) {
				let cmd = cmds[i];
				if (cmd === undefined) break;
				if ((cmd.permissions & Permission.Staff) && !isAdm) continue;
				let helpMessage = cmd.shortHelp[cmd.shortHelp.length - 1].includes('!') ? cmd.shortHelp : `${cmd.shortHelp}.`;
				final.addField(cmd.aliases[0], helpMessage);
				++count;
			}
		}

		msg.channel.send(final);
	},
	permissions: Permission.None,
	aliases: ["help", "ajuda"],
	shortHelp: "Helpa aqui!",
	longHelp: "HEEEELP",
	example: `${Server.prefix}help\n${Server.prefix}help comando\n${Server.prefix}help númeroDaPágina`
};