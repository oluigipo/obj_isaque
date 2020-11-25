import { Command, Arguments, Permission, Emojis, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";
import * as SteamReviews from "../../steam-reviews";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (!(msg.member?.hasPermission("ADMINISTRATOR") || msg.author.id === "327576484396924929" /*id do gabe*/))
			return;

		msg.mentions.users.forEach(user => {
			SteamReviews.pointTo(user.id);
			SteamReviews.update();
		});

		msg.react(Emojis.yes).catch(discordErrorHandler);
	},
	aliases: ["cr_give"],
	syntaxes: ["<@user...>"],
	description: "Dá entrada para um usuário no giveaway.",
	help: "Dá entrada para um usuário no giveaway.",
	examples: ["@luigipo"],
	permissions: Permission.MOD
}