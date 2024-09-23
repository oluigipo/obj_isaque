import { Command, Argument, Permission, InteractionOptionType, ArgumentKind, validatePermissions } from "../index";
import Discord from "discord.js";
import * as Common from "../../common";
import * as Database from "../../database";
import * as StringSimilarity from 'string-similarity';

const maxNameLength = 128;

let Tags = Database.collections.tags;
const reservedWords = [
    "create",
    "category",
    "categories",
    "search",
    "delete",
    "info",
    "remove",
];

function listOfTagsAsEmbed(msg: Discord.Message<true>, tags: Database.Tag[], title?: string): any {
    const embed = Common.defaultEmbed(Common.notNull(msg.member));
    if (title)
        embed.title = title;
    let currentField = "";
    let firstIter = true;
    for (const tagWithScore of tags) {
        if (currentField.length + tagWithScore.name.length > 1024) {
            embed.fields.push({ name: "", value: currentField });
            currentField = "";
            firstIter = true;
        }

        if (!firstIter)
            currentField += ", ";
        firstIter = false;
        currentField += tagWithScore.name;
    }
    embed.fields.push({ name: "", value: currentField });
    return embed;
}

async function searchTag(msg: Discord.Message<true>, term: string) {
    term = term.toLowerCase();

    const all = await Tags.find({}, {projection: { _id: 0, name: 1, categories: 1 }}).toArray();
    if (all.length === 0) {
        return msg.reply("nn achei nada");
    }

    let allScored = all.map(tag => {
        let score = StringSimilarity.compareTwoStrings(tag.name, term);
        for (const cat of tag.categories) {
            const catScore = StringSimilarity.compareTwoStrings(cat, term) / 10;
            if (catScore > score)
                score = catScore;
        }
        return { tag, score };
    });

    allScored.sort((a, b) => b.score - a.score);
    allScored = allScored.slice(0, 50);
    const sortedTags = allScored.map(item => item.tag);
    const embed = listOfTagsAsEmbed(msg, sortedTags, `Resultados da pesquisa por: ${term}`);

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
        Tags = Database.collections.tags;
        const defaultsToSearch = String(args[0].value) === "tags";
        if (defaultsToSearch && args.length < 2) {
            const allTags = await Tags.find({}, { projection: { _id: 0, name: 1 } }).toArray();
            for (let i = 0; i < Math.min(allTags.length, 50); ++i) {
                const index = ~~(Math.random() * allTags.length);
                const tmp = allTags[i];
                allTags[i] = allTags[index];
                allTags[index] = tmp;
            }
            await msg.reply({ embeds: [listOfTagsAsEmbed(msg, allTags.slice(0, 50))] });
            return;
        }

		if (args.length < 2) {
            await msg.reply("oq vc quer");
            return;
        }

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
                        createdAt: Date.now(),
                        deletedAt: null,
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
                const categoriesToRemove: string[] = [];
                for (const arg of args.slice(3)) {
                    const [catName, ok] = tagnameFromArg(arg);
                    if (!ok)
                        continue;
                    
                    if (catName.startsWith("-"))
                        categoriesToRemove.push(catName.slice(1));
                    else if (catName.length > maxNameLength) {
                        await msg.reply("nome mt longo");
                        break outerSwitch;
                    } else
                        categories.push(catName);
                }

                let result;
                try {
                    result = await Tags.updateOne({ name: tagName }, {
                        $addToSet: { categories: { $each: categories } },
                    });
                    if (result.matchedCount === 1 && categoriesToRemove.length > 0) {
                        result = await Tags.updateOne({ name: tagName }, {
                            $pullAll: { categories: categoriesToRemove },
                        });
                    }
                } catch (err) {
                    console.error(err);
                }

                if (result && result.modifiedCount === 1) {
                    await msg.reply("atualizado");
                } else if (result && result.matchedCount === 0) {
                    await msg.reply("nn achei essa tag");
                } else if (result && categoriesToRemove.length > 0) {
                    await msg.reply("nenhuma dessas categorias q vc quis remover estavam nessa tag");
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
            case "remove":
            case "delete": {
                if (!validatePermissions(Common.notNull(msg.member), <Discord.TextChannel>msg.channel, Permission.MOD)) {
                    await msg.reply("só adm pode deletar tag");
                    break;
                }
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
            case "info": {
                const [name, nameOk] = tagnameFromArg(args[2]);
                if (!nameOk) {
                    await msg.reply("diz o nome e o valor");
                    break;
                }
                let result;
                try {
                    result = await Tags.findOne({ name });
                } catch (err) {
                    console.error(err);
                }

                if (!result) {
                    await msg.reply("nn conheço essa tag");
                    break;
                }
                const embed = Common.defaultEmbed(Common.notNull(msg.member));
                embed.title = name;
                embed.fields = [
                    { name: "Categorias", value: result.categories.join(",") || "(nenhuma)", inline: true },
                    { name: "Criada por", value: `<@${result.createdBy}>`, inline: true },
                    { name: "Criada em", value: new Date(result.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }), inline: true },
                    { name: "Conteúdo", value: result.value },
                ];
                await msg.reply({ embeds: [embed] });
            } break;
            default:
                if (defaultsToSearch)
                    await searchTag(msg, command);
                else
                    await getTag(msg, command);
                break;
        }
	},
	syntaxes: [
        "tag <nome>",
        "tag create <nome> <...conteúdo>",
        "tag search <...nome ou categorias>",
        "tag category <nome> [categoria] [-categoria]",
        "tag categories <nome> [categoria] [-categoria]",
        "tag info <nome>",
        "tag delete <nome>",
        "tag remove <nome>",
    ],
	permissions: Permission.NONE,
	aliases: ["tag", "t", "tags"],
	description: "mexe com tags",
	help: "mexe com tags.\nSe o nome da categoria começar com `-`, eu vou remover ela ao invés de adicionar.\nA pesquisa funciona por nome e categoria.",
	examples: ["zero", "category dankicu danki dankicode meme"],
	
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
