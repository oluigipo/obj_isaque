const Discord = require('discord.js');

const client = new Discord.Client();

const isEvalEnabled = false;
const specialInvite = 'p9WN6Rx';
let prefix = "!!";
const roleToAdd = "585871344718184458";
const cursoLink = "https://www.udemy.com/course/torne-se-um-desenvolvedor-de-jogos-2d/?couponCode=GM_STUDIO2";
const admins = ["373670846792990720", "330403904992837632", "412797158622756864", "457020706857943051", "290130764853411840"];
const shitpostChannel = "playground";

function isAdmin(_user) {
	return admins.indexOf(_user.id) !== -1;
}

const invites = {};

//const wait = require('util').promisify(setTimeout);

client.on('ready', () => {
	//wait(1000);

	client.guilds.forEach(g => {
		g.fetchInvites().then(guildInvites => {
			invites[g.id] = guildInvites;
		});
	});

	console.log("Online");
	client.user.setPresence({ game: { name: "o curso do NoNe!", url: cursoLink, type: 3 }, status: "online" })
		.then(console.log)
		.catch(console.error);
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
		msg.channel.send(`O prefixo atual é \`${prefix}\``);
		return;
	}

	// Antes
	//if (msg.content[0] !== prefix) return;

	// Depois
	if (msg.content.slice(0, prefix.length) !== prefix) return;

	const args = msg.content.slice(prefix.length, msg.content.length).split(' ');
	switch (args[0]) {
		case "curso":
			msg.channel.send(`${msg.author} Aqui está o link do curso: ${cursoLink}`);
			break;
		case "ping":
			if (msg.channel.name !== shitpostChannel) break;
			const m = await msg.channel.send("...");
			m.edit(`\`Bot Latency:\` ${m.createdTimestamp - msg.createdTimestamp}ms\n\`API Latency:\` ${Math.round(client.ping)}ms`);
			break;
		case "setprefix":
			if (!isAdmin(msg.author)) break;
			if (args.length < 2) {
				msg.channel.send(`${msg.author} Essa sintaxe para este comando é inválida.`);
				break;
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
			if (!isAdmin(msg.author)) break;
			if (args.length < 2) {
				msg.channel.send(`Uso correto: \`${prefix}kick @user...\``);
				break;
			}

			msg.mentions.members.forEach(m => {
				if (m.kickable) {
					m.kick();
					msg.channel.send(`O usuário ${m.user.tag} foi kickado.`).catch(console.error);
				} else {
					msg.channel.send(`Não é possível kickar o usuário ${m.user.tag}.`).catch(console.error);
				}
			});
			break;
		case "ban":
			if (!isAdmin(msg.author)) break;
			if (args.length < 2) {
				msg.channel.send(`Uso correto: \`${prefix}ban @user...\``);
				break;
			}

			msg.mentions.members.forEach(m => {
				if (m.kickable) {
					m.ban();
					msg.channel.send(`O usuário ${m.user.tag} foi banido.`).catch(console.error);
				} else {
					msg.channel.send(`Não é possível banir o usuário ${m.user.tag}.`).catch(console.error);
				}
			});
			break;
		case "ulon":
			if (msg.channel.name !== shitpostChannel) break;
			const qnt = Math.floor(Math.random() * 200 + 2);
			msg.channel.send("UL" + "O".repeat(qnt) + "N")
				.catch(console.error);
			break;
		default: msg.channel.send(`${msg.author} Comando desconhecido.`); console.log(args); break;
	}

});

client.login('NjMwODkyNjY5Mzg3OTMxNjQ5.XZvwgA.giplHaiI73t62ThkYwMqKygpgIM');
