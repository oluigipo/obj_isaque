// @NOTE(luigi): not checked

import { Command, Argument, Permission } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

let cache: any[] = [];
let lastCached = -1;
let index = 0;

let timePerCache = Common.TIME.day;

function sendMeme(msg: Message) {
	let final = Common.defaultEmbed(Common.notNull(msg.member));

	const post = cache[index++];
	const title = post.data.title.length > 256 ? `${post.data.title.slice(0, 253)}...` : post.data.title;

	final.title = title;
	final.url = `https://www.reddit.com${post.data.permalink}`;
	final.image = { url: post.data.url };

	msg.channel.send({ embeds: [final] }).catch(Common.discordErrorHandler);
}

export default <Command>{
	async run(msg: Message, args: Argument[]) {
		let now = Date.now();

		if (lastCached + timePerCache < now || index >= cache.length) {
			Common.simpleRequest("https://www.reddit.com/r/ProgrammerHumor/top/.json?sort=top&t=week&limit=100").then(data => {
				cache = JSON.parse(data).data.children.filter((post: any) => post.data.post_hint === 'image');
				index = 0;
				lastCached = now;
				sendMeme(msg);
			}).catch(error => {
				Common.error(error);
				msg.channel.send(`${msg.author} Algo deu errado ao fazer a request para o Reddit...`).catch(Common.discordErrorHandler);
			});
		} else {
			sendMeme(msg);
		}
	},
	syntaxes: [""],
	permissions: Permission.SHITPOST,
	aliases: ["ph", "programmerhumor"],
	description: "/r/ProgrammerHumor",
	help: "Pega um meme no top 100 do [/r/ProgrammerHumor](https://reddit.com/r/ProgrammerHumor).",
	examples: []
};