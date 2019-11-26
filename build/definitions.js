"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Constants
exports.Roles = {
    Aluno: "585871344718184458",
    Default: "630202297716178964",
    Bot: "589633044013514784",
    Mod: "507553894310608899",
    Muted: "568171976556937226"
};
exports.Server = {
    specialInvite: "p9WN6Rx",
    id: "507550989629521922",
    prefix: "!!"
};
exports.Channels = {
    shitpost: "553933292542361601",
    music: "621805258519216130"
};
exports.Files = {
    mutes: "./data/mutes.json",
    cassino: "./data/usersdata.json"
};
exports.Time = {
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7
};
exports.Emojis = {
    yes: '✅',
    horse: '🏇'
};
exports.CommonMessages = {
    syntaxError: "Sintaxe incorreta.",
};
// Functions
function formatDate(ms) {
    var str = [];
    switch (true) {
        case ms > exports.Time.week:
            var weeks = Math.trunc(ms / exports.Time.week);
            ms = ms % exports.Time.week;
            str.push(weeks + " semana" + (weeks > 1 ? 's' : ''));
        case ms > exports.Time.day:
            var days = Math.trunc(ms / exports.Time.day);
            ms = ms % exports.Time.day;
            str.push(days + " dia" + (days > 1 ? 's' : ''));
        case ms > exports.Time.hour:
            var hours = Math.trunc(ms / exports.Time.hour);
            ms = ms % exports.Time.hour;
            str.push(hours + " hora" + (hours > 1 ? 's' : ''));
        case ms > exports.Time.minute:
            var minutes = Math.trunc(ms / exports.Time.minute);
            ms = ms % exports.Time.minute;
            str.push(minutes + " minuto" + (minutes > 1 ? 's' : ''));
        case ms > exports.Time.second:
            var seconds = Math.trunc(ms / exports.Time.second);
            ms = ms % exports.Time.second;
            str.push(seconds + " segundo" + (seconds > 1 ? 's' : ''));
            break;
    }
    if (str.length === 0) {
        return "alguns instantes";
    }
    else if (str.length === 1) {
        return str[0];
    }
    var last = str[str.length - 1];
    str = str.slice(0, str.length - 1);
    var final = str.join(", ") + " e " + last;
    return final;
}
exports.formatDate = formatDate;
