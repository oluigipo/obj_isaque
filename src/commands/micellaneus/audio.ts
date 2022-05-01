import { Command, Argument, Permission, ArgumentKind, InteractionOptionType } from "../index";
import Discord from "discord.js";
import * as Common from "../../common";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus  } from "@discordjs/voice";

const audios: { [key: string]: string } = {
	ola: "ola-pessoal",
	conseguiram: "conseguiram",
	pessoas: "oi_pessoas_que_estao_me_assistindo",
	proficional: "proficional"
};

const keys = Object.keys(audios);
let alreadyPlaying = false;

async function exec(member: Discord.GuildMember, key?: string) {
	if (!member.voice.channel)
		return;
	
	let audio = audios[key ?? ""] ?? audios[keys[Math.floor(Math.random() * keys.length)]];

	// NOTE(ljre): We can't have more than one audio playing at the same time anyway.
	alreadyPlaying = true;

	const audioResource = createAudioResource(`assets/${audio}.ogg`);
	const audioPlayer = createAudioPlayer();

	audioPlayer.play(audioResource);

	const connection = joinVoiceChannel({
		channelId: member.voice.channel.id,
		guildId: member.guild.id,
		adapterCreator: member.guild.voiceAdapterCreator,
	});

	connection.subscribe(audioPlayer);

	audioPlayer.on(AudioPlayerStatus.Idle, () => {
		audioPlayer.stop();
		connection.destroy();
		alreadyPlaying = false;
	});
}

export default <Command>{
	async run(msg: Discord.Message, args: Argument[], raw: string[]) {
		if (!msg.member || !msg.member.voice.channel || alreadyPlaying || msg.member.voice.channel.type === "GUILD_STAGE_VOICE") {
			msg.react(Common.EMOJIS.no);
			return;
		}

		msg.react(Common.EMOJIS.yes);
		
		let audio: string | undefined;
		if (args.length > 1 && args[1].kind === ArgumentKind.STRING) {
			audio = args[1].value;
		}
		
		return await exec(msg.member, audio);
	},
	aliases: ["audio", "efeito_especial_muito_louco"],
	syntaxes: ["[audio = random]"],
	description: "Imagina só ouvir o none te dar um \"olá\".",
	help: "Já ouvi isso tantas vezes que não sei se é da minha cabeça ou se esqueci de sair de uma call <:pepe_surrender:745960957552885772>\n\nÁudios: "
		+ `\`${keys.join('`, `')}\``,
	examples: [""],
	permissions: Permission.NONE,
	
	interaction: {
		async run(int: Discord.CommandInteraction) {
			const member = await int.guild?.members.fetch(int.user.id);
			if (!member || !member.voice.channel || alreadyPlaying || member.voice.channel.type === "GUILD_STAGE_VOICE") {
				int.reply("entra num canal de voz aí pô").catch(Common.discordErrorHandler);
				return;
			}
			
			let audio: string | undefined;
			if (int.options.data.length > 0 && int.options.data[0].name === "audio" && typeof int.options.data[0].value === "string") {
				audio = int.options.data[0].value;
				
				if (!keys.includes(audio)) {
					int.reply("essa não é uma opção, camarada").catch(Common.discordErrorHandler);
					return;
				}
			}
			
			int.reply("tô chegando").catch(Common.discordErrorHandler);
			exec(member, audio);
		},
		
		options: [
			{
				type: InteractionOptionType.STRING,
				name: "audio",
				description: "nome do áudio pra tocar",
				required: false,
				choices: keys.map(key => ({ name: key, value: key })),
			},
		],
	}
}
