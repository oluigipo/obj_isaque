// @NOTE(luigi): not checked

import { Command, Arguments, Server, Time, Channels, Permission, defaultEmbed, notNull } from "../../defs";
import { Message } from "discord.js";
import request from 'request';

let cache: any[] = [];
let lastCached = -1;
let index = 0;

let timePerCache = Time.day;

function sendMeme(msg: Message) {
	let final = defaultEmbed(notNull(msg.member));

	const post = cache[index++];
	const title = post.data.title.length > 256 ? `${post.data.title.slice(0, 253)}...` : post.data.title;

	final.title = title;
	final.url = `https://www.reddit.com${post.data.permalink}`;
	final.image = { url: post.data.url };

	msg.channel.send(final);
}

export default <Command>{
	async run(msg: Message, args: Arguments) {
		let now = Date.now();

		if (lastCached + timePerCache < now || index >= cache.length) {
			request("https://www.reddit.com/r/ProgrammerHumor/top/.json?sort=top&t=week&limit=100", {}, (error, response) => {
				if (error) {
					console.log(error);
					msg.channel.send(`${msg.author} Algo deu errado ao fazer a request para o Reddit...`);
					return;
				}

				cache = JSON.parse(response.body).data.children.filter((post: any) => post.data.post_hint === 'image');
				index = 0;
				lastCached = now;
				sendMeme(msg);
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
	examples: [`${Server.prefix}ph`]
};