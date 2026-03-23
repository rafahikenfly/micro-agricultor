import { currentStateInspector } from "../scheduler/currentStateInspector";
import { dailyEffect } from "../scheduler/dailyEffect";
import { mediaStateInspector } from "../scheduler/mediaStateInspector";

export const jobRegistry = {
  dailyEffect,
  currentStateInspector,
  mediaStateInspector,
};