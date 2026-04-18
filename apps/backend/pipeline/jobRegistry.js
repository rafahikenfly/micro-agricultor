import { currentStateInspector } from "../scheduler/currentStateInspector.js";
import { dailyEvolution } from "../scheduler/dailyEvolution.js";
import { mediaStateInspector } from "../scheduler/mediaStateInspector.js";
import { taskStateInspector } from "../scheduler/taskStateInspector.js"

export const jobRegistry = {
  dailyEvolution,
  currentStateInspector,
  mediaStateInspector,
  taskStateInspector,
};