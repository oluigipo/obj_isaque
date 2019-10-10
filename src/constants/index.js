const specialInvite = 'MbFMYVJ';
const prefix = '!!';
const roleToAdd = "630917234826543105";
const roleToAddAnyway = "630936042224222229";
const shitpostChannel = "playground";
const sintaxErrorMessage = "Sintaxe do comando incorreta. Consulte o !!help para confirmar a sintaxe deste comando. Caso você tenha certeza que o comando está sendo usado do jeito certo, contate um Moderador ou um Administrador!";
const helpMessage = "```markdown\n< help > Comandos do Bot\n< mute >    Mutar um usuário (Staff Only)\n< unmute >  Desmutar um usuário (Staff Only)\n< ban >     Banir um usuário (Staff Only)\n< kick >    Kickar um usuário (Staff Only)\n< ping >    Pong!\n< ulon >    ULOOOOOOOON\n< curso >   Envia um link com cupom de desconto do curso do NoNe\n< emoji >   Envia um emoji por você\n< nonetube > Envia o link do canal no Youtube do NoNe```";
const helpCommands = {
    mute: `Muta um ou mais usuários no servidor. Uso: \`\`\`\n${prefix}mute @user\n${prefix}mute 30m @user\n${prefix}mute @user1 @user2...\n${prefix}mute 1h @user1 @user2...\n\`\`\``,
    unmute: `Desmuta um ou mais usuários no servidor. Uso: \`\`\`\n${prefix}unmute @user\n${prefix}unmute @user1 @user2...\n\`\`\``,
    ban: `Bane um ou mais usuários do servidor. Uso: \`\`\`\n${prefix}ban @user\n${prefix}ban @user1 @user2...\n\`\`\``,
    kick: `Kicka um ou mais usuários do servidor. Uso: \`\`\`\n${prefix}kick @user\n${prefix}kick @user1 @user2...\n\`\`\``,
    ping: "Pong! Pong!",
    ulon: `Use \`${prefix}ulon\` para ver quantos O's você consegue! <:Jebaited:575786620368977940>`,
    curso: "Envia um link com cupom de desconto do curso do NoNe",
    nonetube: `Envia o link do canal no Youtube do NoNe. Uso \`\`\`${prefix}nonetube\`\`\``,
    help: "!!help help help",
    emoji: `Envia um emoji por ti no discord. Uso: \`\`\`${prefix}emoji nomeDoEmoji\`\`\``
};

const cursoLink = "http://bit.ly/35iBP6O";
const youtubeLink = "https://www.youtube.com/channel/UCHJPSW9FgSoXGVFV489XXag";

module.exports = {
    //    id,
    specialInvite,
    prefix,
    roleToAdd,
    roleToAddAnyway,
    cursoLink,
    shitpostChannel,
    helpMessage,
    helpCommands,
    sintaxErrorMessage,
    youtubeLink
}
