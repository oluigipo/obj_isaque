import { Command, Arguments, Server, Permission, defaultEmbed, notNull, ArgumentKind, discordErrorHandler } from "../../defs";
import { Message } from "discord.js";
import request from 'request';

const moedas_cambio: any = {
	"CAD": "Dólar Canadense",
	"HKD": "Dólar de Hong Kong",
	"ISK": "Coroa islandesa",
	"PHP": "Peso filipino",
	"DKK": "Coroa dinamarquesa",
	"HUF": "Florim húngaro",
	"CZK": "Coroa checa",
	"GBP": "Libra esterlina",
	"RON": "Leu romeno",
	"SEK": "Coroa sueca",
	"IDR": "Rupia indonésia",
	"INR": "Rupia indiana",
	"BRL": "Real",
	"RUB": "Rublo russo",
	"HRK": "Kuna croata",
	"JPY": "Iene japonês",
	"THB": "Baht tailandês",
	"CHF": "Franco suíço",
	"EUR": "Euro",
	"MYR": "Ringuite malaio",
	"BGN": "Lev búlgaro",
	"TRY": "Lira turca",
	"CNY": "Iuane chinês",
	"NOK": "Coroa norueguesa",
	"NZD": "Dólar da Nova Zelândia",
	"ZAR": "Rand sul-africano",
	"USD": "Dólar dos Estados Unidos",
	"MXN": "Peso mexicano",
	"SGD": "Dólar de Singapura",
	"AUD": "Dólar australiano",
	"ILS": "Novo siclo israelita",
	"KRW": "Won sul-coreano",
	"PLN": "Zlóti polaco"
};

export default <Command>{
	async run(msg: Message, args: Arguments, _: string[]) {
		let multiplier = 1;
		let moeda = "USD";
		args.shift(); // consume command

		if (args.length > 0 && args[0].kind === ArgumentKind.STRING) {
			moeda = moedas_cambio[args[0].value] ? args[0].value : "USD";
			args.shift();
		}

		if (args.length > 0 && args[0].kind === ArgumentKind.NUMBER)
			multiplier = args[0].value;

		request(`https://api.exchangeratesapi.io/latest?base=${moeda}&symbols=BRL`, { json: true }, (err, response) => {
			if (err) {
				console.error(err);
				msg.channel.send(`${msg.author} Algo deu errado ao fazer a request para o API...`).catch(discordErrorHandler);
				return;
			}

			let data = response.body;
			if (data.error) return msg.channel.send(data.error).catch(discordErrorHandler);
			let num = data.rates.BRL;
			let date = data.date;

			let emb = defaultEmbed(notNull(msg.member))
				.addField(moedas_cambio[moeda], `**${multiplier}**`, true)
				.addField(`≈`, `** ­**`, true)
				.addField(`Real`, `**${(num * multiplier).toFixed(2)}**`, true)
				.setFooter(`Data dos dados: ${date}`)


			msg.channel.send(emb).catch(discordErrorHandler);
		});
	},
	syntaxes: ["", "[moeda] [quantidade]"],
	permissions: Permission.SHITPOST,
	aliases: ["dolar"],
	description: "Mostra o valor do dolar, feito por <@310480160640073729>",
	help: "Mostra o valor do dolar (O valor não é atualizado em tempo real)\nAPI usada: [exchangeratesapi.io](https://exchangeratesapi.io/).\nFeito por <@310480160640073729>",
	examples: [`${Server.prefix}dolar`, `${Server.prefix}dolar 25`]
};
