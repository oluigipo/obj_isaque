import Bank from "../Bank";

export default function CorridaDeCavalo(msg, maxUsers, timeToRun, duration, cost) {
    Bank.corridaCurrent = true;
    const filter = (reaction, user) => reaction.emoji.name === discordServer.yesEmoji && user.id !== msg.client.user.id && Banco.isRegistered(user.id);
    const horseEmoji = '🏇';
    let users = [];
    msg.channel.send(`${msg.author} A corrida de cavalos iniciará em ${timeToRun} segundos! A aposta é de \`$${cost}\``)
        .then(message => {
            message.react(discordServer.yesEmoji)
                .then(() => {
                    const collector = message.createReactionCollector(filter, { time: timeToRun * 1000 });
                    collector.on("end", collection => {
                        collection.forEach(reaction => {
                            reaction.users.forEach(user => {
                                if (msg.client.user.id !== user.id && users.length < maxUsers) {
                                    const result = Banco.horseraceJoin(user.id, cost);
                                    if (result === -1) {
                                        msg.channel.send(`${user} Você não está registrado!`);
                                    } else if (result === -2) {
                                        msg.channel.send(`${user} Você não tem dinheiro o suficiente para participar desta corrida!`);
                                    } else {
                                        users.push(user.id);
                                    }
                                }
                            });
                        });

                        if (users.length < 2) {
                            msg.channel.send("Não é possível ter corrida com menos de 2 participantes!");
                            Bank.corridaCurrent = false;
                        } else {
                            gameRun(users, message);
                        }
                    });
                });
        });

    function gameRun(users, mymsg) {
        let horses = [];

        let _maxstr = String(users.length).length + 1;
        let newText = `Total acumulado: ${cost * users.length}\nParticipantes escolhidos (Total: ${users.length}):\n\`\`\``;
        for (let i = 0; i < users.length; i++) {
            horses.push({ progress: 1, owner: users[i] });
            const member = mymsg.guild.members.find(a => a.id === users[i]);
            newText += `${i + 1 + (' '.repeat(_maxstr - String(i).length))}- ${member.user.tag}\n`;
        }
        newText += "```";
        mymsg.edit(newText).then(msg => {
            msg.channel.send("...").then(message => tick(message, horses));
        });
    }

    function tick(message, horses) {
        let winner = -1;
        let newText = "Progresso da corrida:```";

        for (let i = 0; i < horses.length; i++) {
            if (Math.random() < 0.75) horses[i].progress++;

            newText += `${i + 1 + (i < 9 ? ' ' : '  ')}- |`;
            newText += ' '.repeat(duration - horses[i].progress);
            newText += `${horseEmoji}`;
            newText += `${' '.repeat(duration - (duration - horses[i].progress) - 1)}|\n`;

            if (horses[i].progress >= duration) {
                winner = i;
            }
        }

        let member;
        if (winner > 0) {
            member = message.guild.members.find(a => a.id === horses[winner].owner);
            newText = `Vencedor: ${member.user}\n` + newText;
        } else {
            newText = "Vencedor: (Ainda em andamento...)\n" + newText;
        }

        newText += "```";

        message.edit(newText).then(msg => {
            if (winner === -1) setTimeout(tick, discordServer.timing.second / 2, message, horses);
            else {
                let moneyWon = horses.length * cost;
                member = message.guild.members.find(a => a.id === horses[winner].owner);
                Banco.giveMoney(horses[winner].owner, moneyWon);
                msg.channel.send(`Parabéns, ${member.user}! Você acaba de ganhar \`$${moneyWon}\`!`);
                Bank.corridaCurrent = false;
            }
        });
    }
}