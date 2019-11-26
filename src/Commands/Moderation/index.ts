import { Command } from "../../definitions";

import mute from "./mute";
import unmute from "./unmute";
import ban from "./ban";
import kick from "./kick";
import eval from "./eval";

export default <Command[]>[mute, unmute, ban, kick, eval];