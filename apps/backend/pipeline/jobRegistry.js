import { currentStateInspector } from "../scheduler/currentStateInspector.js";
import { dailyEvolution } from "../scheduler/dailyEvolution.js";
import { mediaTaskInspector } from "../scheduler/mediaTaskInspector.js";
import { plantStageInspector } from "../scheduler/plantStageInspector.js";
import { reportTaskInspector } from "../scheduler/reportTaskInspector.js";
import { taskStateInspector } from "../scheduler/taskStateInspector.js"

export const jobRegistry = {
  dailyEvolution,
  currentStateInspector,
  mediaTaskInspector,
  taskStateInspector,
  plantStageInspector,
  reportTaskInspector,
};