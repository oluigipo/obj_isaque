import { Command } from "../../definitions";

import ping from "./ping";
import help from "./help";
import nt from "./nonetube";
import github from "./github";
import num from "./number";
import calc from "./calc";
import color from "./color";

export default <Command[]>[ping, help, nt, github, num, calc, color];