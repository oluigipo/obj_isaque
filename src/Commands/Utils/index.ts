import { Command } from "../../definitions";

import ping from "./ping";
import help from "./help";
import nt from "./nonetube";
import github from "./github";
import num from "./number";
import calc from "./calc";
import color from "./color";
import docs from "./docs";

export default <Command[]>[ping, help, nt, github, num, calc, color, docs];