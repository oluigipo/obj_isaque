import Discord from 'discord.js';
import * as discordServer from './src/constants';

import {
	Bank,
	Moderation,
	Utils,
	Micellaneous
} from "./src/components";

const client = new Discord.Client();

const invites = {};

const wait = require('util').promisify(setTimeout);

const _Moderation = new Moderation();
const _Utils = new Utils();
const _Micellaneous = new Micellaneous();
const _Bank = new Bank();

// Argumentos padrões: (Message, Arguments)
const Commands = {
	mute: _Moderation.mute,
	unmute: _Moderation.unmute,
	ban: _Moderation.ban,
	kick: _Moderation.kick,
	ulon: _Micellaneous.ulon,
	ping: _Utils.ping,
	curso: _Utils.curso,
	help: _Utils.help,
	emoji: _Micellaneous.emoji,
	register: _Bank.register,
	semanal: _Bank.semanal,
	punish: _Bank.punish,
	loteria: _Bank.loteria,
	bilhete: _Bank.bilhete,
	resultado: _Bank.resultado,
	saldo: _Bank.saldo,
	transfer: _Bank.transfer,
	sorteio: _Bank.sorteio,
	messages: _Bank.messages,
	pot: _Bank.pot,
	rank: _Bank.rank,
	mendigar: _Bank.mendigar,
	corrida: _Bank.corrida,
	bingo: _Bank.bingo,
	danki: _Micellaneous.danki,
	brainfuck: _Micellaneous.brainfuck,
	nonetube: _Utils.nonetube,

	eval(msg: Discord.Message, args: string[]) {
		if (!(msg.author.id === "373670846792990720" || msg.author.id === "330403904992837632")) return;
		if (args.length < 2) {
			msg.channel.send(`${msg.author} Sintaxe incorreta.`);
			return;
		}

		const cmd = args.slice(1, args.length).join(' ');
		let result;
		try {
			result = eval(cmd);
		} catch (e) {
			result = e;
		}
		msg.channel.send(String(result));
	}
};

client.on('ready', () => {
	wait(3000);

	client.guilds.forEach(g => {
		g.fetchInvites().then(guildInvites => {
			invites[g.id] = guildInvites;
		});
	});

	console.log("Online");
	client.user.setPresence({ game: { name: "o curso do NoNe!", url: discordServer.cursoLink, type: "WATCHING" }, status: "online" })
		.catch(console.error);

	const minute = 1000 * 60;
	const curr = Date.now();
	setTimeout(Moderation.autoUnmute, minute - (curr % minute), client);
});

client.on('guildMemberAdd', (member: Discord.GuildMember) => {
	if (member.user.bot) {
		member.addRole(discordServer.roleBot);
		return;
	}

	if (Moderation.isMuted(member.user.id))
		member.addRole(Moderation.roleMuted);

	member.guild.fetchInvites().then(guildInvites => {
		const ei = invites[member.guild.id];
		invites[member.guild.id] = guildInvites;
		const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
		//const inviter = invite.inviter.id;

		if (invite !== null && invite.code === discordServer.specialInvite) {
			member.addRole(discordServer.roleAluno);
		} else {
			member.addRole(discordServer.roleDefault);
		}
	});
});

// Comandos
client.on('message', async (msg: Discord.Message) => {
	if (msg.author.id === client.user.id || msg.author.bot) return;
	let justMentioned: boolean = false;
	msg.mentions.members.forEach(m => {
		if (m.id === client.user.id && msg.content.split(' ').length === 1) justMentioned = true;
	});

	if (justMentioned) {
		msg.channel.send(`O prefixo atual é \`${discordServer.prefix}\``);
		return;
	}

	if (msg.content.slice(0, discordServer.prefix.length) !== discordServer.prefix) {
		Bank.onUserMessage(msg);
		return;
	}

	const args: string[] = msg.content.slice(discordServer.prefix.length, msg.content.length).split(' ');

	if (Commands[args[0]] === undefined) {
		msg.channel.send(`${msg.author} Comando desconhecido.`);
		return;
	}

	Commands[args[0]](msg, args);
});

client.login('NjMwODkyNjY5Mzg3OTMxNjQ5.XZvwgA.giplHaiI73t62ThkYwMqKygpgIM');


