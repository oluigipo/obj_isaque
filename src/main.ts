import * as fs from "fs";
import Discord from "discord.js";
import * as Common from "./common";

// NOTE(ljre): Load essentials and setup globals
const auth = JSON.parse(fs.readFileSync("auth.json", "utf8"));
const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMembers,
		Discord.GatewayIntentBits.GuildBans,
		Discord.GatewayIntentBits.GuildEmojisAndStickers,
		Discord.GatewayIntentBits.GuildIntegrations,
		Discord.GatewayIntentBits.GuildWebhooks,
		Discord.GatewayIntentBits.GuildInvites,
		Discord.GatewayIntentBits.GuildVoiceStates,
		Discord.GatewayIntentBits.GuildPresences,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.GuildMessageReactions,
		Discord.GatewayIntentBits.GuildMessageTyping,
		Discord.GatewayIntentBits.GuildScheduledEvents,
	],
});
const rest = new Discord.REST({ version: '10' }).setToken(auth.token);

Common.setupGlobals(client, rest, auth);

type Invite = { code: string, uses: number, author: Discord.User | null; };
type Invites = { [key: string]: Invite };

let invites: Invites;

// NOTE(ljre): Pipelines
import * as Commands from "./commands";
import * as Database from "./database";
import * as Moderation from "./moderation";
import * as Giveaway from "./giveaway";
import * as Balance from "./balance";
import * as AutoRoles from "./autoroles";

// NOTE(ljre): A pipeline is just an array of async functions that shall be executed in order when an event is triggered.
//             A function may return a falsey value that is not undefined to stop the pipeline.

const initPipeline = [
	async () => Common.log("Logging in..."),
	Database.init,
	Moderation.init,
	Commands.init,
	Balance.init,
	Giveaway.init,
	AutoRoles.init,
	async () => {
		invites = await fetchInvites() ?? {};

		client.user?.setActivity("o curso do NoNe!", { type: Discord.ActivityType.Watching });

		Common.log("Online!");
	},
];

const donePipeline = [
	AutoRoles.done,
	Giveaway.done,
	Balance.done,
	Commands.done,
	Moderation.done,
	Database.done,
	async () => Common.log("Logging out..."),
	async () => process.exit(0),
];

const messagePipeline = [
//	async (m: Discord.Message) => isOurGuild(m.guild?.id),
	shouldProcessMessage,
	Moderation.message,
	answerQuestion,
	Balance.message,
	Commands.message,
];

const interactionCreatePipeline = [
	Commands.interactionCreate,
];

const memberJoinedPipeline = [
	async (m: Discord.GuildMember) => isOurGuild(m.guild?.id),
	Moderation.memberJoined,
	joinedMessage,
];

const memberLeftPipeline = [
	async (m: Discord.GuildMember) => isOurGuild(m.guild?.id),
	leftMessage,
];

const reactionAddPipeline = [
	//async (r: Discord.MessageReaction) => isOurGuild(r.message.guild?.id),
	AutoRoles.reactionAdd,
];

const reactionRemovePipeline = [
	async (r: Discord.MessageReaction) => isOurGuild(r.message.guild?.id),
	AutoRoles.reactionRemove,
];

async function runPipeline(name: string, pipeline: ((...args: any[]) => any)[], ...args: any[]) {
	// NOTE(ljre): Check if we are being rate-limited.
	if (Date.now() <= Common.apiTimeout)
		return;

	for (const fn of pipeline) {
		try {
			const result = await fn(...args);
			if (result !== undefined && !result)
				break;
		} catch (error) {
			Common.error(`following error when running ${name} pipeline: ${error}`);
		}
	}
}

// NOTE(ljre): Events
client.once("ready", async () => await runPipeline("init", initPipeline));
client.on("messageCreate", async (message) => await runPipeline("message", messagePipeline, message));
client.on("interactionCreate", async (interaction) => await runPipeline("interaction", interactionCreatePipeline, interaction));
client.on("inviteCreate", addInvite);
client.on("messageReactionAdd", async (reaction, user) => await runPipeline("reactionAdd", reactionAddPipeline, reaction, user));
client.on("messageReactionRemove", async (reaction, user) => await runPipeline("reactionRemove", reactionRemovePipeline, reaction, user));
client.on("guildMemberRemove", async (member) => await runPipeline("memberLeft", memberLeftPipeline, member));
client.on("guildMemberAdd", async (member) => {
	const invite = await checkForChangedInvite();
	await runPipeline("memberJoined", memberJoinedPipeline, member, invite);
});

process.on("beforeExit", async () => await runPipeline("done", donePipeline));
process.on("SIGINT", async () => await runPipeline("done", donePipeline));
process.on("SIGTERM", async () => await runPipeline("done", donePipeline));

client.login(auth.token);

// NOTE(ljre): Functions
function isOurGuild(str: string | null | undefined) {
	return str === Common.SERVER.id;
}

async function shouldProcessMessage(message: Discord.Message): Promise<boolean> {
	if (message.author.bot || !Commands.validChannelTypes.includes(message.channel.type) || message.content.length < 1)
		return false;

	return true;
}

async function answerQuestion(message: Discord.Message) {
	if (!message.content.startsWith(Common.SERVER.prefix) && message.mentions.members?.has(Common.notNull(client.user).id) && message.content.endsWith('?')) {
		const respostas = [
			"Sim",
			"Não",
			"depende",
			"obviamente",
			"talvez...",
			`não sei. Pergunta pro(a) ${message.guild?.members.cache.random()?.displayName ?? "sua mãe"}`,
			"não quero falar contigo. sai",
			"hmmmm... Já tentou apagar a system32?",
		];

		if (message.content.toLowerCase().includes("sentido da vida")) {
			message.channel.send(`${message.author} é simples: 42`).catch(Common.discordErrorHandler);
		} else {
			message.channel.send(`${message.author} ${respostas[Math.floor(Math.random() * respostas.length)]}`).catch(Common.discordErrorHandler);
		}

		return false;
	}

	return true;
}

async function checkForChangedInvite(): Promise<string | undefined> {
	let oldInvites = invites;
	let newInvites = await fetchInvites();
	if (!newInvites)
		return undefined;

	let keys = Object.keys(oldInvites);
	let result: string | undefined = undefined;

	for (const key in oldInvites) {
		if (newInvites[key] && newInvites[key].uses > oldInvites[key].uses) {
			result = key;
			break;
		}
	}

	invites = newInvites;

	return result;
}

async function fetchInvites(guild?: Discord.Guild): Promise<Invites | undefined> {
	const inv = await (guild ?? client.guilds.cache.get(Common.SERVER.id))?.invites.fetch();
	if (inv) {
		const invites: Invites = {};
		inv.forEach((value) => invites[value.code] = { code: value.code, uses: value.uses ?? 0, author: value.inviter });
		return invites;
	}

	return undefined;
}

function addInvite(invite: Discord.Invite) {
	invites[invite.code] = { code: invite.code, uses: invite.uses ?? 0, author: invite.inviter };
}

function removeInvite(invite: Discord.Invite) {
	delete invites[invite.code];
}

let joinChannel: Discord.TextChannel;
async function joinedMessage(member: Discord.GuildMember, invite: string | undefined) {
	if (invite === Common.auth.invite)
		member.roles.add(Common.ROLES.aluno);

	const embed = Common.defaultEmbed(member);

	embed.title = "Member Joined";
	embed.description = "";
	//if (banned)
	//	embed.description += "[Cursed Invite] ";

	embed.description += member.toString();
	embed.fields.push({ name: "ID", value: member.id, inline: true });

	let age = "Desconhecido (é null, fazer o quê)";
	if (member.user?.createdTimestamp) {
		age = Common.dateOf(member.user.createdTimestamp);

		const accountAge = Date.now() - member.user.createdTimestamp;
		if (accountAge < Common.TIME.week * 2)
			embed.fields.push({ name: "Account Age (new account)", value: Common.formatTime(accountAge) });
	}

	embed.fields.push({ name: "Creation Date", value: age, inline: true });
	embed.fields.push({ name: "Invite", value: invite ?? "Desconhecido (possivelmente `noneclass`)", inline: true });

	embed.fields.push({ name: "Invite Author", value: (invite ? invites[invite]?.author?.toString() : undefined) ?? "Desconhecido" });

	const user = member.user;
	if (user)
		embed.fields.push({ name: "Username", value: user.tag, inline: true });

	if (!joinChannel)
		joinChannel = <Discord.TextChannel>await client.channels.fetch(Common.CHANNELS.joinLog).catch(Common.discordErrorHandler);

	//Common.log(embed);
	joinChannel.send({ embeds: [Common.fixEmbedIfNeeded(embed)] }).catch(Common.discordErrorHandler);
}

async function leftMessage(member: Discord.GuildMember) {
	const embed = Common.defaultEmbed(member);

	embed.color = 0xff3333;
	embed.title = "Member Left";
	embed.description = member.toString();
	embed.fields.push({ name: "ID", value: member.id, inline: true });
	if (member.user)
		embed.fields.push({ name: "Username", value: member.user.tag, inline: true });
	if (member.roles.cache.size > 0)
		embed.fields.push({ name: "Roles", value: [...member.roles.cache].map(([key, role]) => role.toString()).join(' ') });

	if (!joinChannel)
		joinChannel = <Discord.TextChannel>await client.channels.fetch(Common.CHANNELS.joinLog).catch(Common.discordErrorHandler);

	joinChannel.send({ embeds: [Common.fixEmbedIfNeeded(embed)] }).catch(Common.discordErrorHandler);
}
