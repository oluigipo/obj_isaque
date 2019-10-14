import { 
    specialInvite, 
    serverID, 
    roleToAdd, 
    shitpostChannel
} from "./ServerInfo";
import { helpCommands, helpMessage } from "./Help";

const prefix = '!!';
const sintaxErrorMessage = "Sintaxe do comando incorreta. Consulte o !!help para confirmar a sintaxe deste comando. Caso você tenha certeza que o comando está sendo usado do jeito certo, contate um Moderador ou um Administrador!";
const yesEmoji = '✅';

const timing = {
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 60,
    week: 1000 * 60 * 60 * 60 * 7
}

const cursoLink = "http://bit.ly/35iBP6O";
const youtubeLink = "https://www.youtube.com/channel/UCHJPSW9FgSoXGVFV489XXag";

export {
    serverID,
    roleToAdd,
    specialInvite,
    shitpostChannel,

    prefix,

    cursoLink,
    youtubeLink,

    timing,
    yesEmoji,
    helpMessage,
    helpCommands,
    sintaxErrorMessage,
}
