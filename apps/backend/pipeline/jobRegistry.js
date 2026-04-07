import { currentStateInspector } from "../scheduler/currentStateInspector.js";
import { dailyEffect } from "../scheduler/dailyEvolution.js";
import { mediaStateInspector } from "../scheduler/mediaStateInspector.js";

export const jobRegistry = {
  dailyEffect,
  currentStateInspector,
  mediaStateInspector,
};