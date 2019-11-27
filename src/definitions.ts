import { Message } from "discord.js";

// Types
export type Arguments = string[];
export interface Command {
    run: (msg: Message, args: Arguments) => void;
    staff: boolean;
    aliases: string[];
    shortHelp: string;
    longHelp: string;
    example: string;
}

// Constants
export const Roles = {
    Aluno: "585871344718184458",
    Default: "630202297716178964",
    Bot: "589633044013514784",
    Mod: "507553894310608899",
    Muted: "568171976556937226"
};

export const Server = {
    specialInvite: "p9WN6Rx",
    id: "507550989629521922",
    prefix: "!!"
};

export const Channels = {
    shitpost: "553933292542361601",
    music: "621805258519216130"
}

export const Files = {
    mutes: "./data/mutes.json",
    cassino: "./data/usersdata.json"
};

export const Time = {
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7
};

export const Emojis = {
    yes: '✅',
    horse: '🏇'
};

export const CommonMessages = {
    syntaxError: "Sintaxe incorreta.",
};

// Functions
export function formatDate(ms: number): string {
    let str: string[] = [];

    switch (true) {
        case ms > Time.week:
            const weeks: number = Math.trunc(ms / Time.week);
            ms = ms % Time.week;
            str.push(`${weeks} semana${weeks > 1 ? 's' : ''}`);

        case ms > Time.day:
            const days = Math.trunc(ms / Time.day);
            ms = ms % Time.day;
            str.push(`${days} dia${days > 1 ? 's' : ''}`);

        case ms > Time.hour:
            const hours = Math.trunc(ms / Time.hour);
            ms = ms % Time.hour;
            str.push(`${hours} hora${hours > 1 ? 's' : ''}`);

        case ms > Time.minute:
            const minutes = Math.trunc(ms / Time.minute);
            ms = ms % Time.minute;
            str.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);

        case ms > Time.second:
            const seconds = Math.trunc(ms / Time.second);
            ms = ms % Time.second;
            str.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);
            break;
    }
    if (str.length === 0) {
        return "alguns instantes";
    } else if (str.length === 1) {
        return str[0];
    }

    let last = str[str.length - 1];
    str = str.slice(0, str.length - 1);
    let final = str.join(", ") + " e " + last;
    return final;
}