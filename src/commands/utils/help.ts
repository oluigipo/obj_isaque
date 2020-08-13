import { Command, Arguments, Permission, ArgumentKind, discordErrorHandler, defaultEmbed, notNull, Server, validadePermissions, Time, defaultErrorHandler } from "../../defs";
import { Message, GuildMember, TextChannel, CollectorFilter } from "discord.js";
import cmds from "../index";

function permissions(perm: Permission): string {
	if (perm === Permission.NONE)
		return "Nenhuma";

	let list = [];
	if (perm & Permission.SHITPOST)
		list.push("Shitpost");

	if (perm & Permission.MOD)
		list.push("Administrador");

	if (perm & Permission.DEV)
		list.push("Desenvolvedor");

	return list.join(' ');
}

function showCommand(msg: Message, cmd: Command) {
	let final = defaultEmbed(notNull(msg.member));

	final.title = `Comando: ${cmd.aliases[0]}`;
	final.description = cmd.help;

	let syntaxes = "";
	for (const syntax of cmd.syntaxes) {
		syntaxes += `\`${`${Server.prefix}${cmd.aliases[0]} ${syntax}`.trim()}\`\n`;
	}

	final.addField("Sintaxes", syntaxes);

	if (cmd.aliases.length > 1) {
		let aliases = '`' + cmd.aliases.join("`, `") + '`';
		final.addField("Aliases", aliases);
	}

	final.addField("Permissões Necessárias", permissions(cmd.permissions));

	if (cmd.subcommands) {
		let subcommands = "";
		for (const sub of cmd.subcommands) {
			subcommands += `\`${sub.aliases[0]}\`\n`;
		}

		final.addField("Subcomandos", subcommands);
	}

	let examples = "";
	for (const example of cmd.examples) {
		examples += `\`${`${Server.prefix}${cmd.aliases[0]} ${example}`.trim()}\`\n`;
	}

	if (examples !== "")
		final.addField("Exemplos", examples);

	msg.channel.send(`<@${msg.author}>`, final).catch(discordErrorHandler);
}

async function showPage(msg: Message, ind: number, commands: Command[], member: GuildMember) {
	let final = defaultEmbed(notNull(msg.member));

	const max = Math.floor(commands.length / 9);
	const index = Math.max(Math.min(ind, max), 0);

	final.title = `Página ${index + 1}/${max + 1}`;

	const min = Math.min((index + 1) * 9, commands.length);
	for (let i = 9 * index; i < min; ++i) {
		const cmd = commands[i];
		final.addField(cmd.aliases[0], cmd.description, true);
	}

	msg.edit(`<@${member}>`, final).then(async message => {
		if (index > 0) await message.react('⬅️').catch(discordErrorHandler);
		if (index < max) await message.react('➡️').catch(discordErrorHandler);

		const filter: CollectorFilter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === member.id;
		message.awaitReactions(filter, { maxUsers: 1, time: Time.minute * 3 }).then(collected => {
			const reaction = collected.first();

			if (!reaction)
				return;

			msg.reactions.removeAll().catch(discordErrorHandler);

			if (reaction.emoji.name === '➡️')
				showPage(msg, index + 1, commands, member).catch(defaultErrorHandler);
			else if (reaction.emoji.name === '⬅️')
				showPage(msg, index - 1, commands, member).catch(defaultErrorHandler);

		}).catch(discordErrorHandler);
	}).catch(discordErrorHandler);
}

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		args.shift();

		// @TODO(luigi): support subcommands
		let command: string | undefined;
		while (args.length > 0) {
			if (args[0].kind === ArgumentKind.STRING) {
				command = args[0].value;
				break;
			}
		}

		if (command) {
			for (const cmd of cmds) {
				if (cmd.aliases.includes(command)) {
					showCommand(msg, cmd);
					return;
				}
			}

			msg.reply("não consegui achar esse comando").catch(discordErrorHandler);
		} else {
			const m = <Message>await msg.channel.send('.').catch(discordErrorHandler);
			const member = <GuildMember>msg.member;
			const commands = cmds.filter(c => validadePermissions(member, <TextChannel>msg.channel, c.permissions))
				.sort((a, b) => b.description.length - a.description.length);
			showPage(m, 0, commands, member).catch(defaultErrorHandler);
		}
	},
	aliases: ["help", "ajuda"],
	syntaxes: ["", "<comando> <subcomando...>"],
	description: "Informações sobre os comandos.",
	help: "HEEEEEEELP I NEED SOMEBODY",
	examples: ["help", "mute", "lisp"],
	permissions: Permission.NONE
}