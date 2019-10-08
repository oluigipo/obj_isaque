const Discord = require('discord.js');

const client = new Discord.Client();

const isEvalEnabled = false;
const specialInvite = 'MbFMYVJ';
let prefix = '+';
const roleToAdd = "630917234826543105";
const roleToAddAnyway = "630936042224222229";

const admins = ["373670846792990720", "330403904992837632", "412797158622756864", "457020706857943051"];

function isAdmin(_user) {
	return admins.indexOf(_user.id) !== -1;
}

const invites = {};

const wait = require('util').promisify(setTimeout);

client.on('ready', () => {
	wait(1000);

	client.guilds.forEach(g => {
		g.fetchInvites().then(guildInvites => {
			invites[g.id] = guildInvites;
		});
	});

	console.log("Online");
});

client.on('guildMemberAdd', member => {
	member.guild.fetchInvites().then(guildInvites => {
		const ei = invites[member.guild.id];
		invites[member.guild.id] = guildInvites;
		const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
		//const inviter = invite.inviter.id;

		if (invite.code === specialInvite) {
			member.addRole(roleToAdd);
		}
	});
});

// Comandos
client.on('message', async msg => {
	if (msg.content[0] !== prefix) return;
	const args = msg.content.slice(1, msg.content.length).split(' ');
	switch (args[0]) {
		case "ping":
			const m = await msg.channel.send("...");
			m.edit(`\`Bot Latency:\` ${m.createdTimestamp - msg.createdTimestamp}ms\n\`API Latency:\` ${client.ping}ms`);
			break;
		case "online": msg.channel.send(`${msg.author}, Online!`); break;
		case "teste": msg.channel.send("Teste"); break;
		case "setprefix":
			if (!isAdmin(msg.author)) break;
			if (args.length < 2) {
				msg.channel.send(`${msg.author} Essa sintaxe para este comando é inválida.`);
			}

			prefix = args[1];
			msg.channel.send(`Prefixo alterado para \`${args[1]}\``);
			break;
		case "eval":
			if (!isEvalEnabled || !isAdmin(msg.author)) break;
			const toEval = args.slice(1, args.length).join(' ');
			try {
				const evl = eval(toEval);
				msg.channel.send(`${msg.author} \`${evl}\``);
			} catch (e) {
				msg.channel.send("" + e);
			}
			break;
		case "kick":
			msg.mentions.members.forEach(m => {
				if (m.kickable) {
					m.kick();
					msg.channel.send(`The user ${m.user.username}#${m.user.tag} has been kicked.`).catch(console.error);
				} else {
					msg.channel.send(`Cannot kick ${m.user.username}#${m.user.tag}.`).catch(console.error);
				}
			});
			break;
		case "ban":
			msg.mentions.members.forEach(m => {
				if (m.kickable) {
					m.ban();
					msg.channel.send(`The user ${m.user.username} has been banned.`).catch(console.error);
				} else {
					msg.channel.send(`Cannot ban the user ${m.user.username}.`).catch(console.error);
				}
			});
			break;
		default: msg.channel.send(`${msg.author} Comando desconhecido.`); break;
	}

});

client.login('NjMwODkyNjY5Mzg3OTMxNjQ5.XZvwgA.giplHaiI73t62ThkYwMqKygpgIM');
