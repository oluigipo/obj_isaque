"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definitions_1 = require("../../definitions");
exports.default = {
    run: function (msg, args) {
        if (args.length < 2) {
            msg.channel.send(definitions_1.CommonMessages.syntaxError);
            return;
        }
        var code = args[1];
        var result = interpret(code);
        msg.channel.send(msg.author + " Output: ``` " + result[0] + "```\nMemory: ```" + result[1] + "```");
        function interpret(c) {
            var maxIterations = 10000000;
            var s = 255;
            var output = [];
            var memory = new Array(256);
            var ptr = 0;
            var curr = 0;
            //let infLoop: number = 0;
            for (var i = 0; i < memory.length; i++)
                memory[i] = 0;
            var it = 0;
            while (curr < c.length) {
                if (it > maxIterations) {
                    output.push(" ERROR");
                    break;
                }
                var toBreak = false;
                ptr = ptr & s;
                if (ptr < 0)
                    ptr = s;
                var t = c[curr];
                switch (t) {
                    case '>':
                        ptr++;
                        break;
                    case '<':
                        ptr--;
                        break;
                    case '+':
                        memory[ptr] = (memory[ptr] + 1) & s;
                        break;
                    case '-':
                        if (--memory[ptr] < 0)
                            memory[ptr] = s;
                        break;
                    case '.':
                        output.push(String.fromCharCode(memory[ptr]));
                        break; // .fromCharCode
                    case '[':
                        if (memory[ptr] === 0) {
                            var counter = 0;
                            while (c[++curr] !== ']' || counter > 0) {
                                if (c[curr] === '[')
                                    counter++;
                                else if (c[curr] === ']')
                                    counter--;
                                if (curr > c.length) {
                                    toBreak = true;
                                    break;
                                }
                            }
                            curr++;
                        }
                        break;
                    case ']':
                        if (memory[ptr] !== 0) {
                            var counter = 0;
                            while (c[--curr] !== '[' || counter > 0) {
                                if (c[curr] === ']')
                                    counter++;
                                else if (c[curr] === '[')
                                    counter--;
                                if (curr < 0) {
                                    toBreak = true;
                                    break;
                                }
                            }
                        }
                        break;
                }
                if (toBreak) {
                    output.push(" ERROR!");
                    break;
                }
                curr++;
                it++;
            }
            var result = [output.join(''), memory.join(' ')];
            return result;
        }
    },
    staff: false,
    aliases: ["brainfuck", "bf"],
    shortHelp: "Um interpretador de BF",
    longHelp: "Um interpretador de Brainfuck (Limite de iterações: 10000000)",
    example: definitions_1.Server.prefix + "brainfuck +++[>+++++<-]>[>+++++<-]>+++.+.-.---------."
};
