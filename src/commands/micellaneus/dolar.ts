import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message } from "discord.js";
import * as Common from "../../common";

const moedasCambio: any = {
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
	async run(msg: Message, args: Argument[], _: string[]) {
		let multiplier = 1;
		let moeda = "USD";
		args.shift(); // consume command

		if (args.length > 0 && args[0].kind === ArgumentKind.STRING) {
			const m = args[0].value.toUpperCase();
			moeda = moedasCambio[m] ? m : "USD";
			args.shift();
		}

		if (args.length > 0 && args[0].kind === ArgumentKind.NUMBER)
			multiplier = args[0].value;

		Common.simpleRequest(`https://api.exchangeratesapi.io/latest?base=${moeda}&symbols=BRL`).then(data => {
			let json = JSON.parse(data);

			let num = json.rates.BRL;
			let date = json.date;

			let emb = Common.defaultEmbed(Common.notNull(msg.member));

			emb.fields = [
				{ name: moedasCambio[moeda], value: `**${multiplier}**`, inline: true },
				{ name: "≈", value: `** **`, inline: true },
				{ name: "Real", value: `**${(num * multiplier).toFixed(2)}**`, inline: true },
				{ name: `Data dos dados`, value: `${date}` },
			];

			msg.channel.send({ embeds: [emb] }).catch(Common.discordErrorHandler);
		}).catch(error => {
			Common.error(error);
			msg.channel.send(`Algo deu errado ao fazer request pra API 😔`).catch(Common.discordErrorHandler);
		});
	},
	syntaxes: ["", "[moeda] [quantidade]"],
	permissions: Permission.SHITPOST,
	aliases: ["cambio", "dolar"],
	description: "Mostra o valor do dolar ou outras moedas, feito por <@310480160640073729>",
	help: "Mostra o valor do dolar ou outras moedas (O valor não é atualizado em tempo real)\nAPI usada: [exchangeratesapi.io](https://exchangeratesapi.io/).\nFeito por <@310480160640073729>\nMoedas conhecidas: `" + Object.keys(moedasCambio).join("`, `") + '`',
	examples: [``, `25`, "CAD", "EUR 15"]
};
