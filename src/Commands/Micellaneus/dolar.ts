import { Command, Arguments, Server, Permission } from "../../definitions";
import { Message, RichEmbed } from "discord.js";
import request from 'request';

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
        let multiplier = parseInt(args[1] ?? "1");
        request(`https://api.exchangeratesapi.io/latest?base=USD&symbols=BRL`,{json: true}, (err, response) => {
            if(err){
                console.error(err);
				msg.channel.send(`${msg.author} Algo deu errado ao fazer a request para o API...`);
                return;
            }

            let data = response.body;
            if(data.error) return msg.channel.send(data.error);
            let num = data.rates.BRL;
            let date = data.date;

            let emb = new RichEmbed()
                .addField(`Dolar americano`,`**${multiplier}**`,true)
                .addField(`≈`,`** ­**`,true)
                .addField(`Real`,`**${(num * multiplier).toFixed(2)}**`,true)
                .setFooter(`Data dos dados: ${date}`)
            

            msg.channel.send(emb);
        })
	},
	permissions: Permission.Shitpost,
	aliases: ["dolar"],
	shortHelp: "Mostra o valor do dolar, feito por <@310480160640073729>",
	longHelp: "Mostra o valor do dolar (O valor não é atualizado em tempo real)\nAPI usada: [exchangeratesapi.io](https://exchangeratesapi.io/).\nFeito por <@310480160640073729>",
	example: `${Server.prefix}dolar\n${Server.prefix}dolar 25`
};
