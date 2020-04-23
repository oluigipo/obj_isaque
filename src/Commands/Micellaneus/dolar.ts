import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message, RichEmbed } from "discord.js";
import https from 'https';

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
        const req = https.get(`https://api.exchangeratesapi.io/latest?base=USD&symbols=BRL`, res => {
            res.on('data', (d: any) => {
                let jsonr = d.toString();
                let data = JSON.parse(jsonr);
                if(data.error) return msg.channel.send(data.error);
                let key = Object.keys(data.rates)[0];
                let num = data.rates[key];
                let date = data.date;

                let emb = new RichEmbed()
                    .addField(`Dolar americano`,`**1**`,true)
                    .addField(`=`,`** ­**`,true)
                    .addField(`Real`,`**${num.toFixed(2)}**`,true)
                    .setFooter(`Data dos dados: ${date}`)
                

                msg.channel.send(emb);
            })
        });
        req.on('error', (error: Error) => {
            console.error(`É rapaz, algo não está certo aí:\n ${error}`);
        })
        req.end();
	},
	permissions: Permission.Shitpost,
	aliases: ["dolar"],
	shortHelp: "Mostra o valor do dolar, feito por <@310480160640073729>",
	longHelp: "Mostra o valor do dolar (O valor não é atualizado em tempo real)\nAPI usada: [exchangeratesapi.io](https://exchangeratesapi.io/).\nFeito por <@310480160640073729>",
	example: `${Server.prefix}dolar`
};
