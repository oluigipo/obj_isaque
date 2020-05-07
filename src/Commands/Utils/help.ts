import { Command, Arguments, Server, Permission, Time } from "../../definitions";
import cmds from "../index";
import { Message, RichEmbed, User, Collection, MessageReaction } from "discord.js";
import Moderation from "../../Moderation";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		let final = new RichEmbed();
		final.color = Server.botcolor;
		final.author = { name: (msg.member.nickname ? msg.member.nickname : msg.author.username), icon_url: msg.author.avatarURL };
		final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };
		let isAdm = Moderation.isAdmin(msg.member) || msg.member.hasPermission("ADMINISTRATOR");

		let commands = isAdm ? cmds : cmds.filter((cmd) => !(cmd.permissions & Permission.Staff) && !(cmd.permissions & Permission.Dev));

		if (msg.author.id !== "373670846792990720") commands = commands.filter((cmd) => cmd.aliases[0] !== "eval");

		commands = commands.sort((c1, c2) => Number(c1.aliases[0] > c2.aliases[0]));
		let pagesCount = Math.ceil(commands.length / 10);
		const filter = (...exp: string[]) => (reaction: MessageReaction, user: User) => exp.includes(reaction.emoji.name) && user.id === msg.author.id;

		let message: Message;

		function showPage(page: number) {
			function collectedF(collected: Collection<string, MessageReaction>) {
				let reaction = collected.first();

				if (reaction === undefined || reaction === null) {
					return;
				}

				if (reaction.emoji.name === '➡️') {
					showPage((page + 1) % pagesCount);
				} else {
					let p = page - 1;
					if (p < 0) p = pagesCount - 1;
					showPage(p);
				}
			}
			final = new RichEmbed();

			final.color = Server.botcolor;
			final.author = { name: (msg.member.nickname ? msg.member.nickname : msg.author.username), icon_url: msg.author.avatarURL };
			final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };

			final.title = `Lista de comandos (${page + 1}/${pagesCount})`;

			let count = 0;
			for (let i = page * 9; count < 9; i++) {
				let cmd = commands[i];
				if (cmd === undefined) break;
				final.addField(cmd.aliases[0], cmd.shortHelp, true);
				++count;
			}

			if (message !== undefined) {
				message.edit(final).then(m => {
					message = m;
					m.clearReactions().then(async () => {
						let f: any;
						if (page === pagesCount - 1) {
							await m.react('⬅️');
							f = filter('⬅️');
						} else if (page > 0) {
							await m.react('⬅️')
							await m.react('➡️');
							f = filter('⬅️', '➡️');
						} else {
							await m.react('➡️');
							f = filter('➡️');
						}

						m.awaitReactions(f, { max: 1, time: Time.minute * 5, errors: ['time'] }).then(collectedF);
					});
				});
			} else {
				msg.channel.send(final).then(async (m) => {
					message = m;

					let f: any;
					if (page === pagesCount - 1) {
						await m.react('⬅️');
						f = filter('⬅️');
					} else if (page > 0) {
						await m.react('⬅️')
						await m.react('➡️');
						f = filter('⬅️', '➡️');
					} else {
						await m.react('➡️');
						f = filter('➡️');
					}

					m.awaitReactions(f, { max: 1, time: Time.minute * 5, errors: ['time'] }).then(collectedF);
				});
			}
		}

		if (args.length === 1) { // !!help
			showPage(0);
			return;
		} else { // !!help comando
			let command = cmds.find((v: Command) => v.aliases.includes(args[1]));
			if (command === undefined) {
				msg.channel.send(`${msg.author} Este comando não existe.`);
				return;
			}

			(function () {
				if (command.subcommands !== void 0) {
					if (args.length > 2) {
						let cc = command.subcommands.find(v => v.aliases.includes(args[2]));
						if (cc !== void 0) {
							command = cc;
							return;
						}
					}
					let ccc = [];
					for (let i = 0; i < command.subcommands.length; i++) {
						ccc.push(command.subcommands[i].aliases[0]);
					}
					final.addField("Subcomandos", ccc.join('\n'));
				}
			})();

			final.title = `Comando: ${command.aliases[0]}${((command.permissions & Permission.Staff) ? " (Staff Only)" : "")}`;
			final.description = command.longHelp;
			if (command.aliases.length > 1) {
				final.addField("Aliases", `\`${command.aliases.join('`, `')}\``);
			}
			final.addField("Exemplo(s)", command.example);

			msg.channel.send(final);
		}
	},
	permissions: Permission.Shitpost | Permission.Cassino,
	aliases: ["help"],
	shortHelp: "HEEEEELP",
	longHelp: "I NEED SOMEBODY! HEEELP",
	example: `${Server.prefix}help\n${Server.prefix}help comando`
};