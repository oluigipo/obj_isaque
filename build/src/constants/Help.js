"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerInfo_1 = require("./ServerInfo");
exports.prefix = '!!';
exports.helpMessage = "```markdown\n< help >     Comandos do Bot\n< mute >     Mutar um usuário (Staff Only)\n< unmute >   Desmutar um usuário (Staff Only)\n< ban >      Banir um usuário (Staff Only)\n< kick >     Kickar um usuário (Staff Only)\n< ping >     Pong!\n< ulon >     ULOOOOOOOON\n< curso >    Envia um link com cupom de desconto do curso do NoNe\n< emoji >    Envia um emoji por você\n< nonetube > Envia o link do canal no Youtube do NoNe\n< register > Te registra no Banco!\n< semanal >  Resgate uma quantidade de dinheiro semanalmente!\n< punish >   Puna um membro confiscando parte de seu dinheiro (Staff Only)\n< loteria >  Inicie uma loteria! (Staff Only)\n< bilhete >  Compre bilhetes para participar da loteria. Quanto mais você compra, maiores as suas chances!\n< resultado >Finalize uma loteria e anuncie o vencedor! (Staff Only)\n< saldo >    Veja quanto dinheiro você tem em sua conta!\n< transfer > Transfira dinheiro para outro usuário.\n< sorteio >  Inicie um sorteio! (Staff Only)\n< messages > Saiba quantas mensagens faltam para receber seu próximo prêmio.\n< pot >      Veja quanto dinheiro está acumulado numa loteria!\n< eval >     Coisa que somente seres superiores podem usar. (Developers Only)\n< rank >     Veja quais são os maiores burgueses do servidor!\n< mendigar > Está com pouca grana? Não se preocupe, pois este comando existe para te ajudar!\n< corrida >  Inicie uma corrida de cavalos! Para mais detalhes, consute \"!!help corrida\". (Staff Only)\n< bingo >    Inicie uma partida de bingo! (Staff Only)\n< danki >    Enviará um meme da Danki!\n< brainfuck >Um interpretador de Brainfuck.```";
exports.helpCommands = {
    mute: `(Staff Only) Muta um ou mais usuários no servidor. Uso: \`\`\`\n${exports.prefix}mute @user\n${exports.prefix}mute 30m @user\n${exports.prefix}mute @user1 @user2...\n${exports.prefix}mute 1h @user1 @user2...\n\`\`\``,
    unmute: `(Staff Only) Desmuta um ou mais usuários no servidor. Uso: \`\`\`\n${exports.prefix}unmute @user\n${exports.prefix}unmute @user1 @user2...\n\`\`\``,
    ban: `(Staff Only) Bane um ou mais usuários do servidor. Uso: \`\`\`\n${exports.prefix}ban @user\n${exports.prefix}ban @user1 @user2...\n\`\`\``,
    kick: `(Staff Only) Kicka um ou mais usuários do servidor. Uso: \`\`\`\n${exports.prefix}kick @user\n${exports.prefix}kick @user1 @user2...\n\`\`\``,
    ping: "Pong! Pong!",
    ulon: `Use \`${exports.prefix}ulon\` para ver quantos O's você consegue! <:Jebaited:575786620368977940>`,
    curso: "Envia um link com cupom de desconto do curso do NoNe",
    nonetube: `Envia o link do canal no Youtube do NoNe. Uso: \`\`\`${exports.prefix}nonetube\`\`\``,
    help: "!!help help help",
    emoji: `Envia um emoji por ti no discord. Uso: \`\`\`${exports.prefix}emoji nomeDoEmoji\`\`\``,
    register: `Com este comando, você irá se registrar no Banco do servidor. Este é o primeiro passo para participar de eventos como a loteria. Uso: \`\`\`${exports.prefix}register\`\`\``,
    semanal: `Resgate uma certa quantidade de dinheiro semanalmente. Uso: \`\`\`${exports.prefix}semanal\`\`\``,
    punish: `(Staff Only) Puna um membro confiscando um pouco de seu dinheiro (ou todo seu dinheiro). Uso: \`\`\`${exports.prefix}punish quantidade @membro\`\`\``,
    loteria: `(Staff Only) Inicie uma loteria. Uso: \`\`\`${exports.prefix}loteria valorDeCadaBilhete\`\`\``,
    bilhete: `Compre biletes para participar da loteria. Quantos mais você comprar, maiores as suas chances de vencer. Uso \`\`\`${exports.prefix}bilhete quantidade\`\`\``,
    resultado: `(Staff Only) Finalize uma loteria e revele o resultado. Uso: \`\`\`${exports.prefix}resultado\`\`\``,
    saldo: `Veja quanto saldo há em sua conta. Uso: \`\`\`${exports.prefix}saldo\n${exports.prefix}saldo @membro\`\`\``,
    transfer: `Transfira dinheiro para outro usuário. Uso: \`\`\`${exports.prefix}transfer quantidade @membro\`\`\``,
    sorteio: `Inicie um sorteio! Um sorteio consiste em entregar uma quantidade de dinheiro (que veio do nada) para algum membro aleatório que reagir a sua mensagem. Uso: \`\`\`${exports.prefix}sorteio quantidade duraçãoEmSegundos\`\`\``,
    messages: `Veja quantas mensagens lhe faltam para receber seu próximo prêmio. A cada 100 mensagens, você recebe uma quantia de dinheiro (mensagens que forem enviadas no #${ServerInfo_1.shitpostChannel} não contarão). Uso: \`\`\`${exports.prefix}messages\n${exports.prefix}messages @member\`\`\``,
    pot: `Veja quanto dinheiro está acumulado numa loteria acontecendo agora. Uso: \`\`\`${exports.prefix}pot\`\`\``,
    eval: `Por que está perguntando? Você não irá usá-lo de qualquer maneira! <:Jebaited:575786620368977940>`,
    rank: `Saiba qual é o rank das pessoas mais ricas do servidor! Uso: \`\`\`${exports.prefix}rank\`\`\``,
    mendigar: `Mendigue um pouco de dinheiro. Vai que alguém te dá algo. Obs.: Você só pode mendigar uma vez por dia! Uso: \`\`\`${exports.prefix}mendigar\`\`\``,
    corrida: `(Staff Only) Inicie uma belíssima corrida de cavalos! Uso (Obs.: O tempo é calculado em segundos!): \`\`\`${exports.prefix}corrida maxDeParticipantes tempoAtéComeçar TamanhoDaPista Aposta\`\`\``,
    bingo: `(Staff Only) Inicie uma partida de bingo. Para ganhar é necessário fazer uma linha ou uma coluna. Uso: \`\`\`${exports.prefix}bingo tempoAtéComeçar tamanhoDaTabela premio\`\`\``,
    danki: `Enviará um meme da Danki! Uso: \`\`\`${exports.prefix}danki\`\`\``,
    brainfuck: `Um interpretador (meio ruim) de Brainfuck. Uso: \`\`\`${exports.prefix}brainfuck +++[>+++++<-]>[>+++++<-]>+++.+.-.---------.\`\`\``
};
