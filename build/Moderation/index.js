"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../definitions");
var fs_1 = __importDefault(require("fs"));
exports.default = {
    autoUnmute: function (client) {
        var raw = fs_1.default.readFileSync(definitions_1.Files.mutes, 'utf8');
        var json = JSON.parse(raw);
        var now = Date.now();
        var _loop_1 = function (i) {
            var userid = json.mutes[i].userid;
            var duration = json.mutes[i].duration;
            var time = json.mutes[i].time;
            if (now > time + duration && duration > 0) {
                var guild = client.guilds.get(definitions_1.Server.id);
                if (guild == undefined) {
                    console.error("WTF");
                    return out_i_1 = i, "continue";
                }
                var member = guild.members.find(function (a) { return a.id === userid; });
                if (member) {
                    member.removeRole(definitions_1.Roles.Muted);
                    member.setMute(false);
                }
                json.mutes = json.mutes.filter(function (a, ind) { return ind !== i; });
                return out_i_1 = i, "continue";
            }
            ++i;
            out_i_1 = i;
        };
        var out_i_1;
        for (var i = 0; i < json.mutes.length;) {
            _loop_1(i);
            i = out_i_1;
        }
        var _m = JSON.stringify(json);
        fs_1.default.writeFileSync(definitions_1.Files.mutes, _m);
        setTimeout(this.autoUnmute, definitions_1.Time.minute, client);
    },
    unmute: function (client, userid) {
        var raw = fs_1.default.readFileSync(definitions_1.Files.mutes, 'utf8');
        var json = JSON.parse(raw);
        var guild = client.guilds.get(definitions_1.Server.id);
        if (guild == undefined) {
            console.error("WTF");
            return false;
        }
        var member = guild.members.find(function (a) { return a.id === userid; });
        if (member) {
            member.removeRole(definitions_1.Roles.Muted);
            member.setMute(false);
            json.mutes = json.mutes.filter(function (a) { return a.userid !== userid; });
            var _m = JSON.stringify(json);
            fs_1.default.writeFileSync(definitions_1.Files.mutes, _m);
            return true;
        }
        return false;
    },
    mute: function (client, userid, duration) {
        var raw = fs_1.default.readFileSync(definitions_1.Files.mutes, 'utf8');
        var json = JSON.parse(raw);
        var guild = client.guilds.get(definitions_1.Server.id);
        if (guild == undefined) {
            console.error("WTF");
            return false;
        }
        var member = guild.members.find(function (a) { return a.id === userid; });
        if (member) {
            member.addRole(definitions_1.Roles.Muted);
            member.setMute(true);
            json.mutes.push({ userid: userid, duration: duration === undefined ? -1 : duration, time: Date.now() });
            var _m = JSON.stringify(json);
            fs_1.default.writeFileSync(definitions_1.Files.mutes, _m);
            return true;
        }
        return false;
    },
    isMuted: function (userid) {
        var raw = fs_1.default.readFileSync(definitions_1.Files.mutes, 'utf8');
        var json = JSON.parse(raw);
        return json.mutes.findIndex(function (user) { return user.userid === userid; }) !== -1;
    },
    isAdmin: function (member) {
        return member.roles.has(definitions_1.Roles.Mod);
    },
    ban: function (client, userid) {
        var guild = client.guilds.get(definitions_1.Server.id);
        if (guild == undefined) {
            console.error("WTF");
            return false;
        }
        var member = guild.members.find(function (a) { return a.id === userid; });
        if (member && member.bannable) {
            member.ban();
            return true;
        }
        return false;
    }
};
