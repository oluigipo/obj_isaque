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
    "edit",
    "rename",
    "find",
];

function listOfStringsAsEmbed(msg: Discord.Message<true>, strs: string[], title?: string): any {
    const embed = Common.defaultEmbed(Common.notNull(msg.member));
    if (title)
        embed.title = title;
    let currentField = "";
    let firstIter = true;
    for (const str of strs) {
        if (currentField.length + str.length > 1024) {
            embed.fields.push({ name: "", value: currentField });
            currentField = "";
            firstIter = true;
        }

        if (!firstIter)
            currentField += ", ";
        firstIter = false;
        currentField += str;
    }
    embed.fields.push({ name: "", value: currentField });
    return embed;
}

async function findTag(msg: Discord.Message<true>, term: string) {
    term = term.toLowerCase();

    const all = await Tags.find({}, {projection: { _id: 0, name: 1, categories: 1 }}).toArray();
    if (all.length === 0) {
        return msg.reply("nn achei nada");
    }

    let allScored = all.map(tag => {
        let score = StringSimilarity.compareTwoStrings(tag.name, term);
        for (const cat of tag.categories) {
            const catScore = StringSimilarity.compareTwoStrings(cat, term) * 0.75;
            if (catScore > score)
                score = catScore;
        }
        return { tag, score };
    });

    allScored.sort((a, b) => b.score - a.score);
    allScored = allScored.slice(0, 50);
    allScored = allScored.filter(item => item.score > 0.35);
    const sortedTags = allScored.map(item => item.tag);
    const embed = listOfStringsAsEmbed(msg, sortedTags.map(tag => tag.name), `Resultados da pesquisa por: ${term}`);

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

    if (msg.channel?.isSendable())
        return msg.channel.send(`${tag.value}`);
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
            await msg.reply({ embeds: [listOfStringsAsEmbed(msg, allTags.slice(0, 50).map(tag => tag.name))] });
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

        let allowChanges = false;
        if (msg.member && !msg.member.roles.cache.has(Common.ROLES.tagsban)) {
            allowChanges = true;
        }

        const command = String(commandArgument.value);
        outerSwitch: switch (command) {
            case "create": {
                if (!allowChanges) {
                    break; // breaks silently
                }
                if (args.length < 4) {
                    await msg.reply("nn vou criar uma tag vazia");
                    break;
                }
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
                const value = msg.content.slice(args[3].offset);
                if (!value) {
                    await msg.reply("diz o valor tbm");
                    break;
                }
                if (value.length > 2000) {
                    await msg.reply("isso ai tem mais de 2000 caracteres, nn consigo mandar msg tão grande");
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
                    if (command === "categories" && args.length === 2) {
                        // NOTE: show all registered categories
                        const allTags = await Tags.find({}, { projection: { _id: 0, categories: 1 } }).toArray();
                        const cats = new Set<string>();
                        for (const tag of allTags) {
                            for (const cat of tag.categories) {
                                cats.add(cat);
                            }
                        }
                        await msg.reply({ embeds: [listOfStringsAsEmbed(msg, [...cats.values()], "Categorias")] });
                        break;
                    }

                    await msg.reply("diz o nome da tag q vc quer botar categorias");
                    break;
                }
                
                if (!allowChanges) {
                    break; // breaks silently
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
            case "find": {
                const [name, ok] = tagnameFromArg(args[2]);
                if (!ok) {
                    await msg.reply("pesquisar oq?");
                } else {
                    await findTag(msg, name);
                }
            } break;
            case "remove":
            case "delete": {
                if (!allowChanges) {
                    break; // breaks silently
                }

                const [name, ok] = tagnameFromArg(args[2]);
                if (!ok) {
                    await msg.reply("deletar oq?");
                    break;
                }
                
                let result;
                try {
                    result = await Tags.findOne({ name });
                } catch (err) {
                    console.error(err);
                }

                if (!result) {
                    await msg.reply("essa tag nem existe");
                    break;
                }

                const isAdmin = validatePermissions(Common.notNull(msg.member), <Discord.TextChannel>msg.channel, Permission.MOD);
                const ownsTag = result.createdBy === msg.author.id;
                if (!isAdmin && !ownsTag) {
                    await msg.reply("só adm pode deletar tag dos outros");
                    break;
                }

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
                    await msg.reply("diz o nome e o conteúdo");
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
            case "edit": {
                if (!allowChanges) {
                    break; // breaks silently
                }

                const [name, nameOk] = tagnameFromArg(args[2]);
                if (!nameOk) {
                    await msg.reply("diz o nome e o conteúdo");
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

                const value = msg.content.slice(args[3].offset);
                if (!value) {
                    await msg.reply("diz o valor tbm");
                    break;
                }
                if (value.length > 2000) {
                    await msg.reply("isso ai tem mais de 2000 caracteres, nn consigo mandar msg tão grande");
                    break;
                }

                let updateResult;
                try {
                    updateResult = await Tags.updateOne({ name }, { $set: { value } });
                } catch (err) {
                    console.error(err);
                }

                if (updateResult && updateResult.modifiedCount) {
                    await msg.reply(`tag chamada \`${name}\` editada`);
                } else {
                    await msg.reply(`deu pau na edição`);
                }
            } break;
            case "rename": {
                if (!allowChanges) {
                    break; // breaks silently
                }

                const [name, nameOk] = tagnameFromArg(args[2]);
                if (!nameOk) {
                    await msg.reply("diz o nome e o novo nome");
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

                const [newName, newNameOk] = tagnameFromArg(args[3]);
                if (!newNameOk) {
                    await msg.reply("diz o novo nome tbm");
                    break;
                }
                if (newName.length > maxNameLength) {
                    await msg.reply("nome mt longo");
                    break;
                }
                if (reservedWords.includes(newName)) {
                    await msg.reply("nome reservado");
                    break;
                }

                if (name === newName) {
                    await msg.reply("mt comedia vc");
                    break;
                }

                let exists;
                let didError = false;
                try {
                    exists = !!(await Tags.findOne({ name: newName }));
                } catch (err) {
                    console.log(err);
                    didError = true;
                }

                if (exists) {
                    await msg.reply("já tem uma outra tag com esse nome");
                    break;
                } else if (didError) {
                    await msg.reply("deu pau pra renomear");
                    break;
                }

                let updateResult;
                try {
                    updateResult = await Tags.updateOne({ name }, { $set: { name: newName } });
                } catch (err) {
                    console.error(err);
                }

                if (updateResult && updateResult.modifiedCount) {
                    await msg.reply(`tag \`${name}\` renomeada pra \`${newName}\``);
                } else {
                    await msg.reply(`deu pau pra renomear`);
                }
            } break;
            case "search": {
                if (args.length < 3) {
                    await msg.reply("pesquisar oq?");
                    break;
                }

                const search = msg.content.slice(args[2].offset);
                let result;
                try {
                    result = await Tags.find({
                        $text: {
                            $search: search,
                        },
                    }, {
                        projection: {
                            _id: 0,
                            name: 1,
                            categories: 1,
                            value: 1,
                        },
                        limit: 10,
                    }).toArray();
                } catch (err) {
                    console.error(err);
                }

                if (!Array.isArray(result)) {
                    await msg.reply("vish, deu pau");
                    break;
                }
                if (result.length === 0) {
                    await msg.reply("sem resultados");
                    break;
                }

                const embed = Common.defaultEmbed(Common.notNull(msg.member));
                for (const doc of result) {
                    let value = "";
                    if (Array.isArray(doc.categories) && doc.categories.length > 0) {
                        value = `**Categories**: ${doc.categories.join(", ")}\n**Value**: `;
                    }
                    if (doc.value.length > 128) {
                        value += doc.value.slice(0, 125);
                        value += "...";
                    } else {
                        value += doc.value;
                    }

                    embed.fields.push({
                        name: doc.name,
                        value,
                    });
                }

                await msg.channel.send({ embeds: [embed] });
            } break;
            default:
                if (defaultsToSearch)
                    await findTag(msg, command);
                else {
                    const [name, ok] = tagnameFromArg(args[1]);
                    if (!ok) {
                        await msg.reply("uma tag nn pode ter esse nome");
                    } else {
                        await getTag(msg, name);
                    }
                }
                break;
        }
	},
	syntaxes: [
        "<nome>",
        "create <nome> <...conteúdo>",
        "search <...nome ou categorias>",
        "category <nome> [categoria] [-categoria]",
        "categories <nome> [categoria] [-categoria]",
        "info <nome>",
        "delete <nome>",
        "remove <nome>",
        "edit <nome> <...conteúdo>",
        "rename <nome> <novo nome>",
        "find <...texto>",
    ],
	permissions: Permission.NONE,
	aliases: ["tag", "t", "tags"],
	description: "mexe com tags",
	help: "mexe com tags.\nSe o nome da categoria começar com `-`, eu vou remover ela ao invés de adicionar.\nA pesquisa padrão funciona por nome e categoria.\nA pesquisa usando `search` funciona por nome, categorias, **e** conteúdo!",
	examples: ["zero", "category dankicu danki dankicode meme", "find programo"],
	
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
