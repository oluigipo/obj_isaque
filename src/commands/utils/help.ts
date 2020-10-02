import { Command, Arguments, Permission, discordErrorHandler, defaultEmbed, notNull, Server, validatePermissions } from "../../defs";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import commands from "..";

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

	return list.join(', ');
}

function helpCommand(msg: Message, name: string) {
	// find command
	let command: Command | undefined;
	const categories = Object.keys(commands);

	for (const cat of categories) {
		let toBreak = false;

		for (const cmd of commands[<keyof typeof commands>cat]) {
			if (cmd.aliases.includes(name)) {
				command = cmd;
				toBreak = true;
				break;
			}
		}

		if (toBreak)
			break;
	}

	if (!command)
		return undefined;

	// write message
	const embed = defaultEmbed(notNull(msg.member));

	embed.title = `Comando: ${command.aliases[0]}`;
	embed.description = command.help;

	let syntaxes = "";
	for (const syntax of command.syntaxes) {
		syntaxes += `\`${`${Server.prefix}${command.aliases[0]} ${syntax}`.trim()}\`\n`;
	}

	embed.addField("Sintaxes", syntaxes);

	if (command.aliases.length > 1) {
		let aliases = '`' + command.aliases.join("`, `") + '`';
		embed.addField("Aliases", aliases);
	}

	embed.addField("Permissões Necessárias", permissions(command.permissions));

	if (command.subcommands) {
		let subcommands = "";
		for (const sub of command.subcommands) {
			subcommands += `\`${sub.aliases[0]}\`\n`;
		}

		embed.addField("Subcomandos", subcommands);
	}

	let examples = "";
	for (const example of command.examples) {
		examples += `\`${`${Server.prefix}${command.aliases[0]} ${example}`.trim()}\`\n`;
	}

	if (examples !== "")
		embed.addField("Exemplos", examples);

	return embed;
}

function helpGeneral(msg: Message) {
	const embed = defaultEmbed(notNull(msg.member));

	embed.title = "Ajuda";
	embed.description = "olha a lista de comandos aí";

	const names = {
		"mice": "Outros",
		"mods": "Moderação",
		"utils": "Utilitários",
		"balance": "Banco",
		"games": "Jogos",
		"image": "Imagens"
	};

	const categories = Object.keys(commands);
	for (const cat of categories) {
		let commandList: string[] = [];
		let _cat = <keyof typeof commands>cat;

		for (const cmd of commands[_cat]) {
			if (validatePermissions(notNull(msg.member), <TextChannel>msg.channel, cmd.permissions))
				commandList.push(cmd.aliases[0]);
		}

		if (commandList.length > 0) {
			commandList.sort();
			embed.addField(names[_cat], `\`\`\`\n${commandList.join('\n')}\n\`\`\``, true);
		}
	}

	embed.fields.sort((a, b) => b.value.length - a.value.length);

	return embed;
}

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		let result: MessageEmbed | undefined;

		if (args.length > 1 && args[1].kind === "STRING") {
			result = helpCommand(msg, args[1].value);

			if (!result) {
				msg.reply("esse comando não existe");
				return;
			}
		} else {
			result = helpGeneral(msg);
		}

		msg.channel.send(`${msg.author}`, result).catch(discordErrorHandler);
	},
	aliases: ["help", "ajuda", "comandos"],
	syntaxes: ["[comando]"],
	description: "Ajuda geral sobre os comandos.",
	help: "HEEEEEEELP I NEED SOMEBODY",
	examples: ["mute", "velha", "help"],
	permissions: Permission.NONE
}