import { Command } from "../definitions";
import Moderation from "./Moderation";
import Utils from "./Utils";
import Micellaneus from "./Micellaneus";
import Cassino from "./Cassino";

export default <Command[]>[...Moderation, ...Utils, ...Micellaneus, ...Cassino];