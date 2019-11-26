import { Command } from "../../definitions";

import bilhete from "./bilhete";
import bingo from "./bingo";
import loteria from "./loteria";
import corrida from "./corrida";
import mendigar from "./mendigar";
import messages from "./messages";
import pot from "./pot";
import punish from "./punish";
import rank from "./rank";
import register from "./register";
import resultado from "./resultado";
import saldo from "./saldo";
import semanal from "./semanal";
import sorteioPauNaSuaCara from "./sorteio";
import transfer from "./transfer";

export default <Command[]>[corrida, register, bilhete, bingo, loteria, mendigar, messages,
    pot, punish, rank, resultado, saldo, semanal, sorteioPauNaSuaCara, transfer
];