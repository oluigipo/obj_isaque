"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerInfo_1 = require("./ServerInfo");
exports.specialInvite = ServerInfo_1.specialInvite;
exports.serverID = ServerInfo_1.serverID;
exports.roleAluno = ServerInfo_1.roleAluno;
exports.roleDefault = ServerInfo_1.roleDefault;
exports.roleBot = ServerInfo_1.roleBot;
exports.shitpostChannel = ServerInfo_1.shitpostChannel;
const Help_1 = require("./Help");
exports.helpCommands = Help_1.helpCommands;
exports.helpMessage = Help_1.helpMessage;
exports.prefix = Help_1.prefix;
const sintaxErrorMessage = "Sintaxe do comando incorreta. Consulte o !!help para confirmar a sintaxe deste comando. Caso você tenha certeza que o comando está sendo usado do jeito certo, contate um Moderador ou um Administrador!";
exports.sintaxErrorMessage = sintaxErrorMessage;
const yesEmoji = '✅';
exports.yesEmoji = yesEmoji;
const timing = {
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7
};
exports.timing = timing;
const cursoLink = "http://bit.ly/35iBP6O";
exports.cursoLink = cursoLink;
const youtubeLink = "https://www.youtube.com/channel/UCHJPSW9FgSoXGVFV489XXag";
exports.youtubeLink = youtubeLink;
