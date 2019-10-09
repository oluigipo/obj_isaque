const Discord = require('discord.js');

const client = new Discord.Client();

const discordServer = require('./src/constants');

// const mainServer = '630891905852506123';
const specialInvite = 'MbFMYVJ';
const prefix = '+';
const roleToAdd = "630917234826543105";
const roleToAddAnyway = "630936042224222229";

let oldMembersCounter;
let inviteToCount;

function fiP() {
	return client.guilds.find(g => g.id === discordServer.id/*mainServer*/);
}

function findInvite(guild) {
	guild.fetchInvites()
		.then(invites => {
			let _inv = (invites.find(a => a.code === specialInvite));
			if (_inv !== undefined) inviteToCount = _inv;
		});
}

function isAdmin(_str) {
	return _str.id === "373670846792990720" || _str.id === "330403904992837632" || _str.id === "412797158622756864" || _str.id === "457020706857943051";
}

client.on('ready', () => {
	findInvite(fiP());
	console.log("online!");
});

client.on('guildMemberAdd', member => {
	findInvite(member.guild);
	if (oldMembersCounter < inviteToCount.uses) {
		member.addRole(roleToAdd);
		member.removeRole(roleToAddAnyway);
		oldMembersCounter = inviteToCount.uses;
		console.log(member.id + ", " + roleToAdd);
	} else {
		console.log(oldMembersCounter,inviteToCount.uses);
	}
});

client.on('message', msg => {
	switch (msg.content) {
		case prefix+"setup":
			if (isAdmin(msg.author)) {
				msg.channel.send("inicializando...");
				if (inviteToCount === undefined) msg.channel.send("nao deu pra achar o invite "+specialInvite);
				else oldMembersCounter = inviteToCount.uses;

				console.log(oldMembersCounter);
				console.log(inviteToCount);
				console.log('I am ready!');
			}
			break;
		case prefix+"invold":
			msg.channel.send(oldMembersCounter);
			break;
		case prefix+"invnow":
			findInvite(fiP());
			msg.channel.send(inviteToCount.uses);
			break;
	}
	
});

client.login('NjMwODkyNjY5Mzg3OTMxNjQ5.XZu66A._w778SUPvzOD7cZy9PVQuF2fHeQ');