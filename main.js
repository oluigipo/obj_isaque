const Discord = require('discord.js');

const client = new Discord.Client();

const discordServer = require('./src/constants');
const Moderation = require('./src/Components/Moderation');
const Utils = require('./src/Components/Utils');
const Micellanious = require('./src/Components/Micellaneous');
const Loteria = require("./src/Components/Bank");

const specialInvite = 'p9WN6Rx';
const roleToAdd = "585871344718184458";

const invites = {};

const wait = require('util').promisify(setTimeout);

// Argumentos padrões: (Message, Arguments)
const Commands = {
	mute: Moderation.mute,
	unmute: Moderation.unmute,
	ban: Moderation.ban,
	kick: Moderation.kick,
	ping: Utils.ping,
	ulon: Micellanious.ulon,
	curso: Utils.curso,
	help: Utils.help,
	emoji: Micellanious.emoji,
	nonetube: Utils.nonetube,
	register: Loteria.register,
	semanal: Loteria.semanal,
	punish: Loteria.punish,
	loteria: Loteria.loteria,
	bilhete: Loteria.bilhete,
	resultado: Loteria.resultado,
	saldo: Loteria.saldo,
	transfer: Loteria.transfer,
	sorteio: Loteria.sorteio,
	messages: Loteria.messages,
	pot: Loteria.pot,
	eval: Moderation.eval_,
	rank: Loteria.rank,
	mendigar: Loteria.mendigar,
	corrida: Loteria.corrida,
	bingo: Loteria.bingo
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

		if (invite !== null && invite.code === specialInvite) {
			member.addRole(roleToAdd);
		}
	});
});

// Comandos
client.on('message', async msg => {
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


