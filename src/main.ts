import { Client, Message, GuildMember, TextChannel } from "discord.js";
import { Command, Arguments, Roles, Server, Time, Channels, Permission } from "./definitions";
import { Bank } from "./Cassino";
import Moderation from "./Moderation";
import cmds from './Commands';
import fs from "fs";
import { start } from "./Shop";

const wait = require('util').promisify(setTimeout);

const client = new Client();

const invites: any = {};
const prefix = "!!";

let typing = 0;

function onUserMessage(msg: Message) {
	let chn: TextChannel = <TextChannel>msg.channel;
	if (chn.id === Channels.shitpost || chn.id === Channels.music || chn.name.startsWith("jogos-bot")) return;
	const result = Bank.userMessage(msg.author.id);
	if (result > 0) {
		let c = (<TextChannel>msg.guild.channels.find(a => a.id === Channels.shitpost));
		if (c !== null) c.send(`${msg.author} Parabéns! Você ganhou \`$${result}\``);
	}
}

client.on("ready", () => {
	wait(3000);

	client.guilds.forEach(g => {
		g.fetchInvites().then(guildInvites => {
			invites[g.id] = guildInvites;
		});
	});

	console.log("Online");

	client.user.setPresence({ game: { name: "o curso do NoNe!", type: "WATCHING" }, status: "online" })
		.catch(console.error);

	const curr = Date.now();
	setTimeout(Moderation.autoUnmute, Time.minute - (curr % Time.minute), client);
	start();
});

client.on("guildMemberAdd", (member: GuildMember) => {
	if (member.user.bot) {
		member.addRole(Roles.Bot);
		return;
	}

	if (Moderation.isMuted(member.user.id))
		member.addRole(Roles.Muted);

	try {
		member.guild.fetchInvites().then(guildInvites => {
			const ei = invites[member.guild.id];
			invites[member.guild.id] = guildInvites;
			const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
			//const inviter = invite.inviter.id;

			if (invite !== null && invite.code === Server.specialInvite) {
				member.addRole(Roles.Aluno);
			} else {
				member.addRole(Roles.Default);
			}
		});
	} catch (e) {
		member.addRole(Roles.Default);
	}
});

client.on("voiceStateUpdate", (oldMember, newMember) => {
	if (newMember.voiceChannelID === undefined) return;
	if (newMember.voiceChannelID === oldMember.voiceChannelID) return;

	if (Moderation.isMuted(newMember.user.id)) {
		if (!newMember.mute) newMember.setMute(true);
	} else {
		if (newMember.mute) newMember.setMute(false);
	}
});

client.on("message", (msg: Message) => {
	if (msg.author.id === client.user.id || msg.author.bot || msg.channel.type !== "text") return;
	onUserMessage(msg);
	if (msg.content.slice(0, prefix.length) !== prefix) {
		let m = msg.mentions.members.first();
		if (m !== undefined && m.user.id === client.user.id && msg.content[msg.content.length - 1] === '?') {
			msg.channel.send(`${msg.author} ${Math.random() >= 0.5 ? "Sim" : "Não"}`);
		}
		return;
	}

	const args: Arguments = msg.content.slice(prefix.length, msg.content.length).split(' ').filter((a) => a !== "");
	if (args.length === 0) return;
	let run: Command | undefined = cmds.find((v: Command) => v.aliases.includes(args[0].toLowerCase()));

	if (run === void 0) return;

	if (run.subcommands !== void 0) {
		const cc = run.subcommands.find(c => c.aliases.includes(args[1]));
		if (cc !== void 0) run = cc;
	}

	// validar permissões
	if (!Moderation.isAdmin(msg.member)) {
		let pass = false;
		if (run.permissions === Permission.None) pass = true;
		if ((run.permissions & Permission.Shitpost) && msg.channel.id === Channels.shitpost) pass = true;
		if ((run.permissions & Permission.Cassino) && Channels.cassino.includes(msg.channel.id)) pass = true;
		if (msg.guild.id !== Server.id) pass = true;
		if (!!(run.permissions & Permission.Staff)) return;

		if (!pass) {
			msg.channel.send(`${msg.author} Você não pode usar esse comando aqui...`).then(mesg => setTimeout(() => {
				(<Message>mesg).delete();
				msg.delete();
			}, Time.second * 5));
			return;
		}
	}

	if ((run.permissions & Permission.Dev) && msg.author.id !== "373670846792990720") return;

	try {
		if (typing++ === 0) msg.channel.startTyping();
		setTimeout(() => {
			(<Command>run).run(msg, args);
			if (--typing === 0) msg.channel.stopTyping(true);
		}, 300);
	} catch (e) {
		console.log("======================= ERRO =======================");
		console.log(e);
		msg.channel.send(`${msg.author} Algo deu beeeeeem errado... Peça para o <@373670846792990720> dar uma averiguada no console!`);
	}
});

client.login(fs.readFileSync("./botkey.txt", "utf8")); // A token não tá no repositório (obviamente)