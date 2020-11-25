import { Command, Arguments, Permission, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";
import * as SteamReviews from "../../steam-reviews";

export default <Command>{
	async run(msg: Message, args: Arguments, raw: string[]) {
		if (!(msg.member?.hasPermission("ADMINISTRATOR") || msg.author.id === "327576484396924929" /*id do gabe*/))
			return;

		msg.delete();
		const user = SteamReviews.pickRandom();

		if (user === "")
			return msg.channel.send("E o vencedor é........\n\nNinguém! Porque não tem ninguém na map com pontos! ||por favor me ajuda||")
				.catch(discordErrorHandler);

		msg.channel.send(`E o vencedor é........\n\n<@${user}>! Parabéns!`).catch(discordErrorHandler);
	},
	aliases: ["cr_roll"],
	syntaxes: [""],
	description: "Pega um usuário aleatório que possui entrada.",
	help: "Pega um usuário aleatório que possui entrada.",
	examples: ["@luigipo"],
	permissions: Permission.NONE
}