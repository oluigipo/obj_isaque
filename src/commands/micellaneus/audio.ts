import { Command, Argument, Permission, ArgumentKind } from "../index";
import { Message, VoiceChannel } from "discord.js";
import * as Common from "../../common";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus  } from "@discordjs/voice";

const audios = {
	ola: "ola-pessoal",
	conseguiram: "conseguiram",
	pessoas: "oi_pessoas_que_estao_me_assistindo",
	proficional: "proficional"
};

type Key = keyof typeof audios;
const keys = <Key[]>Object.keys(audios);
let alreadyPlaying = false;

export default <Command>{
	async run(msg: Message, args: Argument[], raw: string[]) {
		if (!msg.member || !msg.member.voice.channel || alreadyPlaying || msg.member.voice.channel.type === "GUILD_STAGE_VOICE") {
			msg.react(Common.EMOJIS.no);
			return;
		}

		msg.react(Common.EMOJIS.yes);
		let key = keys[Math.floor(Math.random() * keys.length)];
		let audio = audios[key];

		if (args.length > 1 && args[1].kind === ArgumentKind.STRING) {
			audio = audios[<Key>args[1].value] ?? audio;
		}

		// NOTE(ljre): We can't have more than one audio playing at the same time anyway.
		alreadyPlaying = true;

		const audioResource = createAudioResource(`assets/${audio}.ogg`);
		const audioPlayer = createAudioPlayer();

		audioPlayer.play(audioResource);

		const connection = joinVoiceChannel({
			channelId: msg.member?.voice.channel.id,
			guildId: msg.member?.guild.id,
			adapterCreator: Common.notNull(msg.guild).voiceAdapterCreator,
		});

		connection.subscribe(audioPlayer);

		audioPlayer.on(AudioPlayerStatus.Idle, () => {
			audioPlayer.stop();
			connection.destroy();
			alreadyPlaying = false;
		});
	},
	aliases: ["audio", "efeito_especial_muito_louco"],
	syntaxes: ["[audio = random]"],
	description: "Imagina só ouvir o none te dar um \"olá\".",
	help: "Já ouvi isso tantas vezes que não sei se é da minha cabeça ou se esqueci de sair de uma call <:pepe_surrender:745960957552885772>\n\nÁudios: "
		+ `\`${keys.join('`, `')}\``,
	examples: [""],
	permissions: Permission.NONE
}