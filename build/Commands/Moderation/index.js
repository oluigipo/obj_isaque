"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mute_1 = __importDefault(require("./mute"));
var unmute_1 = __importDefault(require("./unmute"));
var ban_1 = __importDefault(require("./ban"));
var kick_1 = __importDefault(require("./kick"));
var eval_1 = __importDefault(require("./eval"));
exports.default = [mute_1.default, unmute_1.default, ban_1.default, kick_1.default, eval_1.default];
