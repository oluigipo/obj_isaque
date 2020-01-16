import { Command, Arguments, Server, Permission, CommonMessages } from "../../definitions";
import { Message } from "discord.js";

// sub cmds
import create from "./create";
import profile from "./profile";
import slogan from "./slogan";
import upgrade from "./upgrades";
import rank from "./rank";
import richest from "./richest";
import emojis from "./emojis";
import work from "./work";
import daily from "./daily";
import company from "./company";
import invite from "./invite";
import join from "./join";
import deny from "./deny";
import crename from "./crename";
import leave from "./leave";
import del from "./delete";
import rename from "./rename";
import apply from "./apply";
import levelup from "./levelup";

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length > 1) msg.channel.send(`${msg.author} Este subcomando não existe.`);
		msg.channel.send(`${msg.author} Use \`${Server.prefix}help shop\` para ver tudo o que é possível fazer com uma lojinha!`);
	},
	permissions: Permission.None,
	aliases: ["shop", "sp", "s"],
	shortHelp: "Tenha a sua própria lojinha no discord!",
	longHelp: "Melhore, compartilhe e disputa! Sua lojinha é o seu negócio, você compra upgrades para ganhar mais dinheiro, participa de empresas e tudo mais! Para começar, use `" + Server.prefix + "shop create emoji nome` para começar!",
	example: `${Server.prefix}shop [comando] ...`,
	subcommands: [
		create, profile, slogan, upgrade, rank, richest, emojis, work,
		daily, company, invite, join, deny, crename, leave, del, rename,
		apply, levelup
	]
};