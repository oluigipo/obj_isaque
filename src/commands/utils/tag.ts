import { Command, Argument, Permission, InteractionOptionType, ArgumentKind } from "../index";
import Discord from "discord.js";
import * as Common from "../../common";
import * as Database from "../../database";
import * as StringSimilarity from 'string-similarity';

const maxNameLength = 128;

const Tags = Database.collections.tags;
const reservedWords = [
    "create",
    "category",
    "categories",
    "search",
    "delete",
];

async function searchTag(msg: Discord.Message<true>, term: string) {
    term = term.toLowerCase();

    const all = await Tags.find({}, {projection: { _id: 0, name: 1, categories: 1 }}).toArray();
    if (all.length === 0) {
        return msg.reply("nn achei nada");
    }

    const allScored = all.map(tag => {
        let score = StringSimilarity.compareTwoStrings(tag.name, term);
        for (const cat of tag.categories) {
            const catScore = StringSimilarity.compareTwoStrings(cat, term) / 10;
            if (catScore > score)
                score = catScore;
        }
        return { tag, score };
    });

    allScored.sort((a, b) => b.score - a.score);

    const embed = Common.defaultEmbed(Common.notNull(msg.member));
    embed.title = `Resultados da pesquisa por: ${term}`;
    let currentField = "";
    for (const tagWithScore of allScored) {
        if (currentField.length + tagWithScore.tag.name.length > 1024) {
            embed.fields.push(currentField);
            currentField = "";
        }

        currentField += ", ";
        currentField += tagWithScore.tag.name;
    }
    embed.fields.push(currentField);

    return msg.reply({ embeds: [embed] });
}

async function getTag(msg: Discord.Message<true> | Discord.CommandInteraction, name: string) {
    const tag = await Tags.findOne({ name });
    if (!tag) {
        return msg.reply("nn achei essa tag");
    }

    if (!tag.value) {
        return msg.reply("essa tag nn tem um valor aparentemente?");
    }

    return msg.reply(`${tag.value}`);
}

function tagnameFromArg(arg: Argument | undefined): [string, boolean] {
    if (!arg) {
        return ["", false];
    }
    if (!["string", "number"].includes(typeof arg.value)) {
        return ["", false];
    }
    return [String(arg.value).toLowerCase(), true];
}

export default <Command>{
	async run(msg: Discord.Message<true>, args: Argument[], raw: string[]) {
		if (args.length < 2) {
            await msg.reply("oq vc quer");
            return;
        }

        const defaultsToSearch = String(args[0].value) === "tags";
        const commandArgument = args[1];
        if (!["string", "number"].includes(typeof commandArgument.value)) {
            await msg.reply("diz o nome certo");
            return;
        }

        const command = String(commandArgument.value);
        outerSwitch: switch (command) {
            case "create": {
                const [name, nameOk] = tagnameFromArg(args[2]);
                if (!nameOk) {
                    await msg.reply("diz o nome e o valor");
                    break;
                }
                if (name.length > maxNameLength) {
                    await msg.reply("nome mt longo");
                    break;
                }
                if (reservedWords.includes(name)) {
                    await msg.reply("nome reservado");
                    break;
                }
                const value = raw.slice(3).join(" ");
                if (!value) {
                    await msg.reply("diz o valor tbm");
                    break;
                }
                const existent = await Tags.findOne({ name });
                if (existent) {
                    await msg.reply("já tem uma tag com esse nome");
                    break;
                }

                let result;
                try {
                    result = await Tags.insertOne({
                        name,
                        value,
                        createdBy: msg.author.id,
                        categories: [],
                    });
                } catch (err) {
                    console.error(err);
                }

                if (result && result.acknowledged) {
                    await msg.reply(`tag chamada \`${name}\` criada`);
                } else {
                    await msg.reply(`deu pau na criação`);
                }
            } break;
            case "category":
            case "categories": {
                const [tagName, tagNameOk] = tagnameFromArg(args[2]);
                if (!tagNameOk) {
                    await msg.reply("diz o nome da tag q vc quer botar categorias");
                    break;
                }
                const categories: string[] = [];
                for (const arg of args.slice(3)) {
                    const [catName, ok] = tagnameFromArg(arg);
                    if (!ok)
                        continue;
                    if (catName.length > maxNameLength) {
                        await msg.reply("nome mt longo");
                        break outerSwitch;
                    }
                    categories.push(catName);
                }

                let result;
                try {
                    result = await Tags.updateOne({ name: tagName }, { $addToSet: { categories: { $each: categories } } });
                } catch (err) {
                    console.error(err);
                }

                if (result && result.modifiedCount === 1) {
                    await msg.reply("atualizado");
                } else {
                    await msg.reply("deu pau");
                }
            } break;
            case "search": {
                const [name, ok] = tagnameFromArg(args[2]);
                if (!ok) {
                    await msg.reply("pesquisar oq?");
                } else {
                    await searchTag(msg, name);
                }
            } break;
            case "delete": {
                const [name, ok] = tagnameFromArg(args[2]);
                if (!ok) {
                    await msg.reply("deletar oq?");
                    break;
                }

                let result;
                try {
                    result = await Tags.deleteOne({ name });
                } catch (err) {
                    console.error(err);
                }

                if (result && result.deletedCount === 1) {
                    await msg.reply("deletado");
                } else {
                    await msg.reply("deu pau");
                }
            } break;
            default:
                if (defaultsToSearch)
                    await searchTag(msg, command);
                else
                    await getTag(msg, command);
                break;
        }
	},
	syntaxes: ["tag <nome>"],
	permissions: Permission.NONE,
	aliases: ["tag", "t", "tags"],
	description: "mexe com tags",
	help: "mexe com tags",
	examples: ["zero"],
	
	interaction: {
		async run(int: Discord.CommandInteraction) {
            const nameOption = int.options.get("nome", true);
			if (nameOption.type !== Discord.ApplicationCommandOptionType.String || !nameOption.value) {
                int.reply("diz o nome da tag");
                return;
            }

            const name = nameOption.value.toString();
            await getTag(int, name);
		},
		options: [
            {
                name: "nome",
                description: "nome da tag",
                type: InteractionOptionType.STRING,
                required: true,
            }
        ],
	},
};
