import { Command, Arguments, Server, CommonMessages, Permission } from "../../definitions";
import { Message, RichEmbed } from "discord.js";

function makeRGB(r: number, g: number, b: number): number {
	return (r << 16) | (g << 8) | (b);
}

function hslToRgb(h: number, s: number, l: number) {
	let r: number, g: number, b: number;

	function hue2rgb(p: number, q: number, t: number): number {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}

	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return makeRGB(r * 255, g * 255, b * 255);
}

function hsvToRgb(h: number, s: number, v: number) {
	let r: number, g: number, b: number;

	let i = Math.floor(h * 6);
	let f = h * 6 - i;
	let p = v * (1 - s);
	let q = v * (1 - f * s);
	let t = v * (1 - (1 - f) * s);

	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
		default: r = 0; g = 0; b = 0; break; // ts error check fix
	}

	return makeRGB(r * 255, g * 255, b * 255);
}

function RGB2BGR(rgb: string): string {
	let r = rgb.slice(0, 2);
	let g = rgb.slice(2, 4);
	let b = rgb.slice(4, 6);

	return b + g + r;
}

function rgbToHsv(r: number, g: number, b: number): number[] {
	r /= 255, g /= 255, b /= 255;

	let max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h = 0, s, v = max;

	let d = max - min;
	s = max == 0 ? 0 : d / max;

	if (max == min) {
		h = 0; // achromatic
	} else {
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}

		h /= 6;
	}

	return [h * 360, s * 100, v * 100].map(a => Math.round(a));
}

function rgbToHsl(r: number, g: number, b: number): number[] {
	r /= 255, g /= 255, b /= 255;

	let max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h = 0, s: number, l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}

		h /= 6;
	}

	return [h * 360, s * 100, l * 100].map(a => Math.round(a));
}

function _format(s: string): string {
	while (s.length < 6) s = '0' + s;
	return s;
}

export default <Command>{
	run: (msg: Message, args: Arguments): void => {
		if (args.length < 2) {
			msg.channel.send(`${msg.author} ${CommonMessages.syntaxError}`);
			return;
		}

		let color: number;
		if (args.length === 2 || args.length === 4) {
			if (args.length > 2) {
				color = makeRGB(parseInt(args[1]), parseInt(args[2]), parseInt(args[3]));
			} else {
				color = parseInt((args[1][0] === '#' ? args[1].slice(1) : args[1]), 16);
			}
		} else
			switch (args[1].toLowerCase()) {
				case 'rgb':
					if (args.length > 3) {
						color = makeRGB(parseInt(args[2]), parseInt(args[3]), parseInt(args[4]));
					} else {
						color = parseInt((args[2][0] === '#' ? args[2].slice(1) : args[2]), 16);
					}
					break;
				case 'bgr':
					if (args.length > 3) {
						color = makeRGB(parseInt(args[4]), parseInt(args[3]), parseInt(args[2]));
					} else {
						color = parseInt(RGB2BGR(args[2][0] === '#' ? args[2].slice(1) : args[2]), 16);
					}
					break;
				case 'hsv':
				case 'hsb':
					if (args.length > 3) {
						color = hsvToRgb(parseInt(args[2]) / 360, parseInt(args[3]) / 100, parseInt(args[4]) / 100);
					} else {
						msg.channel.send(`${msg.author} Não é possível usar hexadecimal para os formatos HSL e HSV/HSB!`);
						return;
					}
					break;
				case 'hsl':
					if (args.length > 3) {
						color = hslToRgb(parseInt(args[2]) / 360, parseInt(args[3]) / 100, parseInt(args[4]) / 100);
					} else {
						msg.channel.send(`${msg.author} Não é possível usar hexadecimal para os formatos HSL e HSV/HSB!`);
						return;
					}
					break;
				default:
					msg.channel.send(`${msg.author} ${args[1]} não está disponível. As disponíveis são: \`rgb\`, \`bgr\`, \`hsv\`/\`hsb\` e \`hsl\``);
					return;
			}

		if (isNaN(color) || color === null || color < 0 || color > 16777215) { // 16777215 é o limite
			msg.channel.send(`${msg.author} Esta cor é inválida!`);
			return;
		}

		let final = new RichEmbed();
		final.color = color;
		final.author = { name: (msg.member.nickname ? msg.member.nickname : msg.author.username), icon_url: msg.author.avatarURL };
		final.footer = { text: msg.client.user.username, icon_url: msg.client.user.avatarURL };

		final.addField("RGB", `${color >> 16}, ${(color >> 8) & 0xff}, ${color & 0xff} (#${_format(color.toString(16))})`, true);
		final.addField("BGR", `${(color & 0xff)}, ${(color >> 8) & 0xff}, ${color >> 16} (#${_format(RGB2BGR(color.toString(16)))})`, true);
		let temp = rgbToHsv(color >> 16, (color >> 8) & 0xff, color & 0xff);
		final.addField("HSV / HSB", `${temp[0]}, ${temp[1]}, ${temp[2]}`, true);
		temp = rgbToHsl(color >> 16, (color >> 8) & 0xff, color & 0xff);
		final.addField("HSL", `${temp[0]}, ${temp[1]}, ${temp[2]}`, true);

		msg.channel.send(final);
	},
	permissions: Permission.None,
	aliases: ["color", "cor"],
	shortHelp: "Veja uma cor em diferentes formatos (incluindo BGR).",
	longHelp: "Converta uma cor para outros formatos de um jeito fácil. Os formatos disponíveis são: \`rgb\`, \`bgr\`, \`hsv\`/\`hsb\` e \`hsl\`",
	example: `${Server.prefix}color rgb RRGGBB\n${Server.prefix}color hsv H S V\n${Server.prefix}color rgb R G B\n${Server.prefix}color #RRGGBB`
};