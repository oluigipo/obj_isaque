"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ping_1 = __importDefault(require("./ping"));
var help_1 = __importDefault(require("./help"));
var nonetube_1 = __importDefault(require("./nonetube"));
exports.default = [ping_1.default, help_1.default, nonetube_1.default];
