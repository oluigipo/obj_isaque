const Discord = require('discord.js');

const client = new Discord.Client();

const discordServer = require('./src/constants');

const isEvalEnabled = false;
const specialInvite = 'p9WN6Rx';
let prefix = "!!";
const roleToAdd = "585871344718184458";
const roleMuted = "568171976556937226";
// const cursoLink = "https://www.udemy.com/course/torne-se-um-desenvolvedor-de-jogos-2d/?couponCode=GM_STUDIO2";
const shitpostChannel = "playground";
const admins = ["373670846792990720", "330403904992837632", "412797158622756864", "457020706857943051", "290130764853411840", "141958545397645312"];
const maxMuteTime = 60 * 60 * 24 * 7 * 2;

function isAdmin(_user) {
	return admins.indexOf(_user.id) !== -1;
}

const invites = {};

const wait = require('util').promisify(setTimeout);

// Argumentos padrões: (Message, Arguments)
const Commands = {
	mute: function (msg, args) {
		if (!isAdmin(msg.author)) return;
		if (args.length < 2) {
			msg.channel.send(`Uso correto: \`\`\`\n${prefix}mute @user\n${prefix}mute 30m @user\n${prefix}mute @user1 @user2...\n${prefix}mute 1h @user1 @user2...\n\`\`\``);
			return;
		}

		let duration = -1;
		let _t;
		let _d;
		if (args.length > 2 && args[1][0] !== '<') {
			_t = parseInt(args[1]);
			_d = args[1][String(_t).length];

			duration = 1;
			switch (_d) {
				case 'w': duration *= 7;
				case 'd': duration *= 24;
				case 'h': duration *= 60;
				case 'm': duration *= 60; break;
				case 's': break;
				default:
					msg.channel.send(`${_t + _d} isn't a valid time`);
					return;
			}

			duration *= _t;

			if (duration > maxMuteTime) {
				msg.channel.send(`Tempo máximo para mute: 2w (2 semanas)`);
				return;
			}
		}

		msg.mentions.members.forEach(m => {
			if (m.manageable) {
				m.addRole(roleMuted);
				if (duration > 0) {
					setTimeout(() => m.removeRole(roleMuted), duration * 1000);
					msg.channel.send(`O usuário ${m.user.tag} foi mutado por ${_formateTime(_t, _d)} com sucesso.`).catch(console.error);
				} else {
					msg.channel.send(`O usuário ${m.user.tag} foi mutado com sucesso.`).catch(console.error);
				}
			} else {
				msg.channel.send(`Não é possível mutar o usuário ${m.user.tag}.`).catch(console.error);
			}
		});

		function _formateTime(_time, _str) {
			let s = `${_time} `;
			switch (_str) {
				case 'w': s += "semana"; break;
				case 'd': s += "dia"; break;
				case 'h': s += "hora"; break;
				case 'm': s += "minuto"; break;
				case 's': s += "segundo"; break;
			}
			if (_time > 1) s += 's';

			return s;
		}
	},
	unmute: function (msg, args) {
		if (!isAdmin(msg.author)) return;
		if (args.length < 2) {
			msg.channel.send(`Uso correto: \`${prefix}unmute @user...\``);
			return;
		}

		msg.mentions.members.forEach(m => {
			if (m.roles.some(a => a.id === roleMuted)) {
				m.removeRole(roleMuted);
				msg.channel.send(`O usuário ${m.user.tag} foi desmutado com sucesso.`);
			}
		});
	},
	ban: function (msg, args) {
		if (!isAdmin(msg.author)) return;
		if (args.length < 2) {
			msg.channel.send(`Uso correto: \`${prefix}ban @user...\``);
			return;
		}

		msg.mentions.members.forEach(m => {
			if (m.bannable) {
				m.ban();
				msg.channel.send(`O usuário ${m.user.tag} foi banido.`).catch(console.error);
			} else {
				msg.channel.send(`Não é possível banir o usuário ${m.user.tag}.`).catch(console.error);
			}
		});
	},
	kick: function (msg, args) {
		if (!isAdmin(msg.author)) return;
		if (args.length < 2) {
			msg.channel.send(`Uso correto: \`${prefix}kick @user...\``);
			return;
		}

		msg.mentions.members.forEach(m => {
			if (m.kickable) {
				m.kick();
				msg.channel.send(`O usuário ${m.user.tag} foi kickado.`).catch(console.error);
			} else {
				msg.channel.send(`Não é possível kickar o usuário ${m.user.tag}.`).catch(console.error);
			}
		});
	},
	/*setprefix: function (msg, args) {
		if (!isAdmin(msg.author)) return;
		if (args.length < 2) {
			msg.channel.send(`${msg.author} Essa sintaxe para este comando é inválida.`);
			return;
		}

		prefix = args[1];
		channel.send(`Prefixo alterado para \`${args[1]}\``);
	},*/
	ping: async msg => {
		if (msg.channel.name !== shitpostChannel) return;
		const m = await msg.channel.send("...");
		m.edit(`\`Bot Latency:\` ${m.createdTimestamp - msg.createdTimestamp}ms\n\`API Latency:\` ${Math.round(client.ping)}ms`);
	},
	ulon: function (msg) {
		if (msg.channel.name !== shitpostChannel) return;
		const qnt = Math.floor(Math.random() * 200 + 2);
		msg.channel.send("UL" + "O".repeat(qnt) + "N")
			.catch(console.error);
	},
	eval: function (msg, args) {
		if (!isEvalEnabled || !isAdmin(msg.author)) break;
		const toEval = args.slice(1, args.length).join(' ');
		try {
			const evl = eval(toEval);
			msg.channel.send(`${msg.author} \`${evl}\``);
		} catch (e) {
			msg.channel.send("" + e);
		}
	},
	curso: function (msg) {
		msg.channel.send(`${msg.author} Aqui está o link do curso: ${discordServer.cursoLink}`);
	}
};

client.on('ready', () => {
	wait(1000);

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

	if (msg.content.slice(0, prefix.length) !== prefix) return;

	const args = msg.content.slice(prefix.length, msg.content.length).split(' ');

	if (Commands[args[0]] === undefined) {
		msg.channel.send(`${msg.author} Comando desconhecido.`);
		return;
	}

	Commands[args[0]](msg, args);
});

client.login('NjMwODkyNjY5Mzg3OTMxNjQ5.XZvwgA.giplHaiI73t62ThkYwMqKygpgIM');
