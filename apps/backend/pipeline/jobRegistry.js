import { currentStateInspector } from "../scheduler/currentStateInspector.js";
import { dailyEffect } from "../scheduler/dailyEffect.js";
import { mediaStateInspector } from "../scheduler/mediaStateInspector.js";

export const jobRegistry = {
  dailyEffect,
  currentStateInspector,
  mediaStateInspector,
};