import { User, Client, Message, GuildMember } from 'discord.js';
import { Roles, Files, Server, Time } from '../definitions';
import fs from 'fs';

interface Muted {
	userid: string;
	duration: number;
	time: number;
}

interface MuteJson {
	mutes: Muted[];
}

function autoUnmute(client: Client): void {
	let raw: string = fs.readFileSync(Files.mutes, 'utf8');
	let json: MuteJson = JSON.parse(raw);
	const now: number = Date.now();

	for (let i = 0; i < json.mutes.length;) {
		const userid = json.mutes[i].userid;
		const duration = json.mutes[i].duration;
		const time = json.mutes[i].time;

		if (now > time + duration && duration > 0) {
			const guild = client.guilds.get(Server.id);

			if (guild === undefined) {
				console.error("WTF");
				continue;
			}

			const member = guild.members.find(a => a.id === userid);
			if (member) {
				member.removeRole(Roles.Muted);
				member.setMute(false);
			}

			json.mutes = json.mutes.filter((a, ind) => ind !== i);
			continue;
		}

		++i;
	}

	const _m = JSON.stringify(json);
	fs.writeFileSync(Files.mutes, _m);

	setTimeout(autoUnmute, Time.minute, client);
}

export default {
	autoUnmute,
	unmute(client: Client, userid: string): boolean {
		let raw: string = fs.readFileSync(Files.mutes, 'utf8');
		let json: MuteJson = JSON.parse(raw);

		const guild = client.guilds.get(Server.id);

		if (guild == undefined) {
			console.error("WTF");
			return false;
		}

		const member = guild.members.find(a => a.id === userid);
		if (member) {
			member.removeRole(Roles.Muted);
			member.setMute(false);

			json.mutes = json.mutes.filter((a) => a.userid !== userid);
			const _m = JSON.stringify(json);
			fs.writeFileSync(Files.mutes, _m);

			return true;
		}

		return false;
	},
	mute(client: Client, userid: string, duration?: number): boolean {
		let raw: string = fs.readFileSync(Files.mutes, 'utf8');
		let json: MuteJson = JSON.parse(raw);

		const guild = client.guilds.get(Server.id);

		if (guild == undefined) {
			console.error("WTF");
			return false;
		}

		const member = guild.members.find(a => a.id === userid);
		if (member) {
			member.addRole(Roles.Muted);
			member.setMute(true);

			json.mutes.push(<Muted>{ userid: userid, duration: duration === undefined ? -1 : duration, time: Date.now() });
			const _m = JSON.stringify(json);
			fs.writeFileSync(Files.mutes, _m);

			return true;
		}

		return false;
	},
	isMuted(userid: string): boolean {
		let raw: string = fs.readFileSync(Files.mutes, 'utf8');
		let json: MuteJson = JSON.parse(raw);

		return json.mutes.findIndex((user: Muted) => user.userid === userid) !== -1;
	},
	isAdmin(member: GuildMember): boolean {
		return member.roles.has(Roles.Mod);
	},
	ban(client: Client, userid: string): boolean {
		const guild = client.guilds.get(Server.id);

		if (guild == undefined) {
			console.error("WTF");
			return false;
		}

		const member = guild.members.find(a => a.id === userid);
		if (member && member.bannable) {
			member.ban();
			return true;
		}

		return false;
	}
};