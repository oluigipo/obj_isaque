import Discord from 'discord.js';
import * as discordServer from './src/constants';

import {
	Moderation,
	Utils,
	Micellaneous,
	Loteria,
} from "./src/components";

const client = new Discord.Client();

const invites = {};

const wait = require('util').promisify(setTimeout);

// Argumentos padrões: (Message, Arguments)
const Commands = {
	...Moderation,
	...Utils,
	...Micellaneous,
	...Loteria,
};

client.on('ready', () => {
	wait(3000);

	client.guilds.forEach(g => {
		g.fetchInvites().then(guildInvites => {
			invites[g.id] = guildInvites;
		});
	});

	console.log("Online");
	client.user.setPresence({ game: { name: "o curso do NoNe!", url: discordServer.cursoLink, type: 3 }, status: "online" })
		.then(console.log)
		.catch(console.error);

	const minute = 1000 * 60;
	const curr = Date.now();
	setTimeout(Moderation.autoUnmute, minute - (curr % minute), client);
});

client.on('guildMemberAdd', member => {
	member.guild.fetchInvites().then(guildInvites => {
		const ei = invites[member.guild.id];
		invites[member.guild.id] = guildInvites;
		const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
		//const inviter = invite.inviter.id;

		if (invite !== null && invite.code === discordServer.specialInvite) {
			member.addRole(discordServer.roleToAdd);
		}
	});
});

// Comandos
client.on('message', async msg => {
	if (msg.author.id === client.user.id) return;
	let justMentioned = false;
	msg.mentions.members.forEach(m => {
		if (m.id === client.user.id && msg.content.split(' ').length === 1) justMentioned = true;
	});

	if (justMentioned) {
		msg.channel.send(`O prefixo atual é \`${discordServer.prefix}\``);
		return;
	}

	if (msg.content.slice(0, discordServer.prefix.length) !== discordServer.prefix) {
		Loteria.onUserMessage(msg);
		return;
	}

	const args = msg.content.slice(discordServer.prefix.length, msg.content.length).split(' ');

	if (Commands[args[0]] === undefined) {
		msg.channel.send(`${msg.author} Comando desconhecido.`);
		return;
	}

	Commands[args[0]](msg, args);
});

client.login('NjMwODkyNjY5Mzg3OTMxNjQ5.XZvwgA.giplHaiI73t62ThkYwMqKygpgIM');


