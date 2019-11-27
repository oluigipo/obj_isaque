import { Command, Arguments, CommonMessages, Server } from "../../definitions";
import { Message } from "discord.js";

// Variáveis que serão usadas só nesse comando
const playlists = {
    "primeiro-jogo": "https://www.youtube.com/watch?v=lak9iTwvN8Q&list=PLKTRv0drNjJ-6bglGqfgBe7YlCstCa2wx",
    rpg: "https://www.youtube.com/watch?v=WvbqpY9CsR8&list=PLKTRv0drNjJ8zkzW9IeJknzDi6E5kjlwL",
    plataforma: "https://www.youtube.com/watch?v=dWKQQfM5l0I&list=PLKTRv0drNjJ_hnDslZnr2N8MXoe1r37N8",
    dialogo: "https://www.youtube.com/watch?v=hd0M6FhX2XQ&list=PLKTRv0drNjJ_wQAPjzYOp2aaCq11XELHh",
    animacao: "https://www.youtube.com/watch?v=dIQ_SIXzpzk&list=PLKTRv0drNjJ8KpDQcJu1kKHG8igpb6hjn",
    tiro: "https://www.youtube.com/watch?v=TOX9goFTqes&list=PLKTRv0drNjJ_aA8ft5-y8Ok2wJfY4n4vj"
};

type __index = "primeiro-jogo" | "rpg" | "plataforma" | "dialogo" | "animacao" | "tiro";

// Comando
export default <Command>{
    run: (msg: Message, args: Arguments) => {
        let link: string = "https://www.youtube.com/channel/UCHJPSW9FgSoXGVFV489XXag";

        if (args.length > 1 && Object.keys(playlists).includes(args[1])) {
            link = playlists[<__index>args[1]];
        }

        msg.channel.send(`${msg.author} ${link}`);
    },
    staff: false,
    aliases: ["nonetube"],
    shortHelp: "Links do canal do NoNe",
    longHelp: "Enviará um link de uma playlist ou o próprio canal do none",
    example: `${Server.prefix}nonetube\n${Server.prefix}nonetube playlist`
};