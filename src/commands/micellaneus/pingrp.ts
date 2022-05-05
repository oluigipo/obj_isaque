import { Command, Argument, Permission, InteractionOptionType } from "../index";
import Discord from "discord.js";
import * as Common from "../../common";

export default <Command>{
	async run(msg: Discord.Message, args: Argument[]) {
		msg.channel.send(`<@${Common.ROLES.rpgplayer}>`).catch(Common.discordErrorHandler);
	},
	syntaxes: [""],
	permissions: Permission.RPG_MASTER,
	aliases: ["ping-rpg", "pingrpg"],
	description: "Marcar o cargo de jogadores do RPG.",
	help: "Marcar o cargo de jogadores do RPG.",
	examples: [],
	
	interaction: {
		async run(int: Discord.CommandInteraction) {
			int.channel?.send(`<@${Common.ROLES.rpgplayer}>`).catch(Common.discordErrorHandler);
		},
		options: [],
	},
};
