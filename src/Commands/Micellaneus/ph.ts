import { Command, Arguments, Server, Time, Channels, Permission } from "../../definitions";
import { Message, RichEmbed } from "discord.js";
import request from 'request';

let cache: any[] = [];
let lastCached = -1;
let index = 0;

let timePerCache = Time.day;

function sendMeme(msg: Message) {
	let final = new RichEmbed();

	final.color = 0x30a246;
	final.author = { name: (msg.member.nickname ? msg.member.nickname : msg.author.username), icon_url: msg.author.avatarURL };
	final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };

	const post = cache[index++];
	const title = post.data.title.length > 256 ? `${post.data.title.slice(0, 253)}...` : post.data.title;

	final.title = title;
	final.url = `https://www.reddit.com${post.data.permalink}`;
	final.image = { url: post.data.url };

	msg.channel.send(final);
}

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (msg.channel.id !== Channels.shitpost) return;
		let now = Date.now();

		if (true) { // lastCached + timePerCache < now || index >= cache.length
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
	permissions: Permission.Shitpost,
	aliases: ["ph", "programmerhumor"],
	shortHelp: "",
	longHelp: "",
	example: `${Server.prefix}ph`
};