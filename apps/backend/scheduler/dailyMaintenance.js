// efeitos/dailyMaintenance.scheduler.js

import cron from "node-cron";
import { dailyEffect } from "./dailyEffect.js";
import { currentStateInspector } from "./currentStateInspector.js";
import { mediaStateInspector } from "./mediaStateInspector.js";
import { runJob } from "../pipeline/runJob.js";
import { log } from "node:console";


const maintenanceTasks = [
    { name: "currentStateInspect", fn: currentStateInspector },
    { name: "mediaStateInspect",  fn: mediaStateInspector },
    // { name: "outraManutencao", fn: outraFuncao },
];

export function dailyMaintenance() {
  log("[CRON] dailyMaintenance agendado para 03:00");

  cron.schedule("0 3 * * *", async () => {
    log("[dailyMaintenance] Iniciando manutenção diária...");

    try {
      await dailyEffect();
    } catch (err) {
      log("ERROR - [dailyMaintenance] Erro em timeEffect:", err);
    }

    const results = await Promise.allSettled([
      runJob("currentStateInspector"),
      runJob("mediaStateInspector"),
    ]);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        log(`ERROR - [dailyMaintenance] Erro na função ${maintenanceTasks[index].name}:`, result.reason);
      }
    });
  });
}