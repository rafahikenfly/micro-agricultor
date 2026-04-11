import { currentStateInspector } from "../scheduler/currentStateInspector.js";
import { dailyEvolution } from "../scheduler/dailyEvolution.js";
import { mediaStateInspector } from "../scheduler/mediaStateInspector.js";

export const jobRegistry = {
  dailyEvolution,
  currentStateInspector,
  mediaStateInspector,
};