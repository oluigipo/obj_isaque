import { Command } from "../../definitions";

import ping from "./ping";
import help from "./help";
import nt from "./nonetube";
import github from "./github";

export default <Command[]>[ping, help, nt, github];