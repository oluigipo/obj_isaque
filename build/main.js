"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var definitions_1 = require("./definitions");
var Cassino_1 = require("./Cassino");
var Moderation_1 = __importDefault(require("./Moderation"));
var Commands_1 = __importDefault(require("./Commands"));
var wait = require('util').promisify(setTimeout);
var client = new discord_js_1.Client();
var invites = {};
var prefix = "!!";
function onUserMessage(msg) {
    var chn = msg.channel;
    if (chn.id === definitions_1.Channels.shitpost || chn.id === definitions_1.Channels.music)
        return;
    var result = Cassino_1.Bank.userMessage(msg.author.id);
    if (result > 0) {
        msg.guild.channels.find(function (a) { return a.id === definitions_1.Channels.shitpost; })
            .send(msg.author + " Parab\u00E9ns! Voc\u00EA ganhou `$" + result + "`");
    }
}
client.on("ready", function () {
    wait(3000);
    client.guilds.forEach(function (g) {
        g.fetchInvites().then(function (guildInvites) {
            invites[g.id] = guildInvites;
        });
    });
    console.log("Online");
    client.user.setPresence({ game: { name: "o curso do NoNe!", url: "", type: "WATCHING" }, status: "online" })
        .catch(console.error);
    var curr = Date.now();
    setTimeout(Moderation_1.default.autoUnmute, definitions_1.Time.minute - (curr % definitions_1.Time.minute), client);
});
client.on("guildMemberAdd", function (member) {
    if (member.user.bot) {
        member.addRole(definitions_1.Roles.Bot);
        return;
    }
    if (Moderation_1.default.isMuted(member.user.id))
        member.addRole(definitions_1.Roles.Muted);
    member.guild.fetchInvites().then(function (guildInvites) {
        var ei = invites[member.guild.id];
        invites[member.guild.id] = guildInvites;
        var invite = guildInvites.find(function (i) { return ei.get(i.code).uses < i.uses; });
        //const inviter = invite.inviter.id;
        if (invite !== null && invite.code === definitions_1.Server.specialInvite) {
            member.addRole(definitions_1.Roles.Aluno);
        }
        else {
            member.addRole(definitions_1.Roles.Default);
        }
    });
});
client.on("message", function (msg) {
    if (msg.author.id === client.user.id || msg.author.bot || msg.channel.type !== "text")
        return;
    onUserMessage(msg);
    if (msg.content.slice(0, prefix.length) != prefix)
        return;
    var args = msg.content.slice(prefix.length, msg.content.length).split(' ');
    var run = Commands_1.default.find(function (v) { return v.aliases.includes(args[0]); });
    if (run == undefined || (run.staff && !Moderation_1.default.isAdmin(msg.member)))
        return;
    run.run(msg, args);
});
client.login('NjMwODkyNjY5Mzg3OTMxNjQ5.XZvwgA.giplHaiI73t62ThkYwMqKygpgIM');
