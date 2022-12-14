import { Command, Argument, Permission, validatePermissions, commands } from "../index";
import { Message, TextChannel, APIEmbed } from "discord.js";
import * as Common from "../../common";

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
	const embed = Common.defaultEmbed(Common.notNull(msg.member));

	embed.title = `Comando: ${command.aliases[0]}`;
	embed.description = command.help;

	let syntaxes = "";
	for (const syntax of command.syntaxes) {
		syntaxes += `\`${`${Common.SERVER.prefix}${command.aliases[0]} ${syntax}`.trim()}\`\n`;
	}

	embed.fields.push({ name: "Sintaxes", value: syntaxes });

	if (command.aliases.length > 1) {
		let aliases = '`' + command.aliases.join("`, `") + '`';
		embed.fields.push({ name: "Aliases", value: aliases });
	}

	embed.fields.push({ name: "Permissões Necessárias", value: permissions(command.permissions) });

	let examples = "";
	for (const example of command.examples) {
		examples += `\`${`${Common.SERVER.prefix}${command.aliases[0]} ${example}`.trim()}\`\n`;
	}

	if (examples !== "")
		embed.fields.push({ name: "Exemplos", value: examples });

	return embed;
}

function helpGeneral(msg: Message) {
	const embed = Common.defaultEmbed(Common.notNull(msg.member));

	embed.title = "Ajuda";
	embed.description = "olha a lista de comandos aí";

	const names = {
		"micellaneus": "Outros",
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
			if (validatePermissions(Common.notNull(msg.member), <TextChannel>msg.channel, cmd.permissions))
				commandList.push(cmd.aliases[0]);
		}

		if (commandList.length > 0) {
			commandList.sort();
			embed.fields.push({ name: names[_cat], value: `\`\`\`\n${commandList.join('\n')}\n\`\`\``, inline: true });
		}
	}

	embed.fields.sort((a: any, b: any) => b.value.length - a.value.length);

	return embed;
}

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		let result: APIEmbed | undefined;

		if (args.length > 1 && args[1].kind === "STRING") {
			result = helpCommand(msg, args[1].value);

			if (!result) {
				msg.reply("esse comando não existe");
				return;
			}
		} else {
			result = helpGeneral(msg);
		}

		msg.channel.send({ content: `${msg.author}`, embeds: result ? [result] : undefined }).catch(Common.discordErrorHandler);
	},
	aliases: ["help", "ajuda", "comandos"],
	syntaxes: ["[comando]"],
	description: "Ajuda geral sobre os comandos.",
	help: "HEEEEEEELP I NEED SOMEBODY",
	examples: ["mute", "velha", "help"],
	permissions: Permission.NONE
}
