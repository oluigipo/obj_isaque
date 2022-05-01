import { Command, Argument, Permission } from "../index";
import Discord from "discord.js";
import * as Common from "../../common";

let cache: any[] = [];
let lastCached = -1;
let index = 0;

let timePerCache = Common.TIME.day;

function sendMeme(user: Discord.User) {
	let final = Common.defaultEmbed(user);

	const post = cache[index++];
	const title = post.data.title.length > 256 ? `${post.data.title.slice(0, 253)}...` : post.data.title;

	final.title = title;
	final.url = `https://www.reddit.com${post.data.permalink}`;
	final.image = { url: post.data.url };

	return { embeds: [final] };
}

async function exec(msg?: Discord.Message, int?: Discord.CommandInteraction) {
	function reply(x: any) {
		if (msg)
			return msg.reply(x);
		if (int)
			return int.reply(x);
	}
	
	const now = Date.now();
	const user = msg?.author ?? int?.user;
	if (!user)
		return;

	if (lastCached + timePerCache < now || index >= cache.length) {
		Common.simpleRequest("https://www.reddit.com/r/ProgrammerHumor/top/.json?sort=top&t=week&limit=100").then(data => {
			cache = JSON.parse(data).data.children.filter((post: any) => post.data.post_hint === 'image');
			index = 0;
			lastCached = now;
			
			reply(sendMeme(user));
		}).catch(error => {
			Common.error(error);
			reply(`${user} Algo deu errado ao fazer a request para o Reddit...`)?.catch(Common.discordErrorHandler);
		});
	} else {
		reply(sendMeme(user));
	}
}

export default <Command>{
	async run(msg: Discord.Message, args: Argument[]) {
		return await exec(msg, undefined);
	},
	syntaxes: [""],
	permissions: Permission.SHITPOST,
	aliases: ["ph", "programmerhumor"],
	description: "/r/ProgrammerHumor",
	help: "Pega um meme no top 100 do [/r/ProgrammerHumor](https://reddit.com/r/ProgrammerHumor).",
	examples: [],
	
	interaction: {
		async run(int: Discord.CommandInteraction) {
			return await exec(undefined, int);
		},
		
		options: [],
	}
};
