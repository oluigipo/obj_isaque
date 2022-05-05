# obj_isaque
Bot do servidor [None Class](https://discord.gg/XxB2XTT) no discord.
## Criando um comando
* É necessário que todos os comandos estejam dentro de uma categoria da pasta `src/commands/` em um arquivo separado;
* Todos os comandos devem ser da interface `Command` declarada na `src/commands/index.ts`;
* O comando deverá ser exportado com `default`;
* Um template de um comando pode ser encontrado em `template.txt`;
* É necessário incluir o seu comando no arquivo `index.ts` de sua categoria.
## Interface `Command`
* `run: (msg: Discord.Message, args: Argument[], raw: string[]) => Promise<any>`: A função que será executada quando o comando for chamado;
> **Argumentos:**
> * `msg: Discord.Message`: Mensagem que chamou o comando;
> * `args: Argument[]`: Argumentos do comando;
> * `raw: string[]`: Argumentos apenas separados por espaço.
* `permissions: Permission`: Permissões necessárias para o uso do comando;
* `aliases: string[]`: Todos os *aliases* do comando (ao menos 1 alias é obrigatório);
* `description: string`: Breve resumo do comando (chamada quando `!!help`);
* `help: string`: Mensagem de ajuda do comando (chamada quando `!!help seuComando`);
* `examples: string[]`: Exemplo de uso do comando ou suas sintaxes;
* `interaction?: Interaction`: Permite o comando ser usado através de Slash Commands.
> * `.run: (int: Discord.CommandInteraction) => Promise<any>`: A função que será executada quando o Slash Command for chamado;
> * `.options: InteractionOption[]`: As opções (aka argumentos) que o comando irá receber.

Quando um comando possui o field `.interaction`, ele será automaticamente registrado pelo bot como slash command.
## Tipo `Argument`
* `Argument` é uma estrutura que possui dois fields: `kind: ArgumentKind` e `value: T`;
* O tipo de `value` depende do valor de `kind`;
* O primeiro argumento sempre será uma `STRING`, que é o alias usado para chamar o comando;
* `NUMBER` sempre será **unsigned**;
* `USERID` sempre será uma string de 18 dígitos;
* `TIME` sempre será em **ms** (milliseconds);
* Referência de cada tipo para `value` dependendo de `kind`:

| **`kind`** |  **`typeof value`** |
| :--------- | ------------------: |
| "MEMBER"   | Discord.GuildMember |
| "STRING"   |              string |
| "CHANNEL"  |Discord.GuildChannel |
| "NUMBER"   |              number |
| "TIME"     |              number |
| "EMOJI"    |       Discord.Emoji |
| "SNOWFLAKE"|              string |
| "USERID" (mesma coisa que "SNOWFLAKE") | string |

