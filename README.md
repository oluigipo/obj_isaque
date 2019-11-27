# obj_isaque
## Criando um comando
* É necessário que todos os comandos estejam dentro de uma categoria da pasta `src/Commands/` em um arquivo separado;
* Todos os comandos devem ser da interface `Command` declarada na `src/definitions.ts`;
* O comando deverá ser exportado com `default`;
* Um template de um comando pode ser encontrado em `info.txt`;
* É necessário incluir o seu comando no arquivo `index.ts` de sua categoria.
## Interface `Command`
* `(msg:  Message, args:  Arguments) =>  void`: A função que será executada quando o comando for chamado;
> * **Argumentos**
> * `msg: Message`: Mensagem que chamou o comando;
> * `args: Arguments`: Argumentos do comando.
* `staff: boolean`: Se a função é exclusiva da Staff;
* `aliases:  string[]`: Todos os *aliases* do comando (Ao menos 1 alias é obrigatório);
* `shortHelp:  string`: Breve resumo do comando (chamada quando `!!help`);
* `longHelp:  string`: Mensagem de ajuda do comando (chamada quando `!!help seuComando`);
* `example:  string`: Exemplo de uso do comando ou suas sintaxes.
## Banco
* Está declarado e inicializado em `src/Cassino/index.ts`;
* Para importá-lo, use `import { Bank } from "relative path";`
* Se quiser saber as funções dele, apenas digite `Bank.` e deixe a Intellisense fazer o trabalho dela :kappa:.
