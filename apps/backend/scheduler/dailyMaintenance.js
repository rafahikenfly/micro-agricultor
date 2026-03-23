// efeitos/dailyMaintenance.scheduler.js

import cron from "node-cron";
import { dailyEffect } from "./dailyEffect.js";
import { currentStateInspector } from "./currentStateInspector.js";
import { mediaStateInspector } from "./mediaStateInspector.js";
import { runJob } from "../pipeline/runJob.js";


const maintenanceTasks = [
    { name: "currentStateInspect", fn: currentStateInspector },
    { name: "mediaStateInspect",  fn: mediaStateInspector },
    // { name: "outraManutencao", fn: outraFuncao },
];

export function dailyMaintenance() {
  cron.schedule("0 3 * * *", async () => {
    console.log("Iniciando manutenção diária...");

    try {
      await dailyEffect();
    } catch (err) {
      console.error("Erro em timeEffect:", err);
    }

    const results = await Promise.allSettled([
      runJob("currentStateInspector"),
      runJob("mediaStateInspector"),
    ]);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Erro na função ${maintenanceTasks[index].name}:`, result.reason);
      }
    });
  });
}