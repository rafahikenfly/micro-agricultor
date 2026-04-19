// efeitos/dailyMaintenance.scheduler.js

import cron from "node-cron";
import { dailyEvolution } from "./dailyEvolution.js";
import { runJob } from "../pipeline/runJob.js";
import { log } from "../core/logger/index.js";
import { cacheService } from "../services/cache.js";


const dailyTasks = [
];

const hourlyTasks = [
  { name: "currentStateInspector" },
  { name: "taskStateInspector"},
  { name: "mediaTaskInspect" },
];

async function runTasks(tasks, label) {
  const results = await Promise.allSettled(
    tasks.map(task => runJob(task.name))
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      log(`ERROR - [${label}] Erro em ${tasks[index].name}:`, result.reason);
    }
  });
}

export function dailyMaintenance() {
  log("[CRON] dailyMaintenance agendado para 03h15");

  cron.schedule("15 3 * * *", async () => {
    log("[dailyMaintenance] Iniciando manutenção diária...");

    try {
      await dailyEvolution();
    } catch (err) {
      log("ERROR - [dailyMaintenance] Erro em dailyEvolution:", err);
    }

    await runTasks(dailyTasks, "dailyMaintenance");

    log("[dailyMaintenance] Finalizada a manutenção diária.");
  });
}

export function hourlyMaintenance() {
  log("[CRON] hourlyMaintenance agendado para cada hora");
  
  cron.schedule("0 * * * *", async () => {
    cacheService.clearCache("variedades");
    cacheService.clearCache("plantas");
    cacheService.clearCache("canteiros");
    cacheService.clearCache("dispositivos");

    log("[hourlyMaintenance] Iniciando manutenção horária...");

    await runTasks(hourlyTasks, "hourlyMaintenance");

    log("[hourlyMaintenance] Finalizada a manutenção horária.");
  });
}

export function refreshCriticalCaches() {
  log("[CRON] refreshCriticalCaches agendado para cada 30 minutos");
  cron.schedule("*/30 * * * *", async () => {
    cacheService.clearCache("caracteristicas");
    cacheService.clearCache("necessidades");

    await Promise.all([
      cacheService.getCaracteristicas(),
      cacheService.getNecessidades()
    ]);
  });

  log("[refreshCriticalCaches]: caches atualizados.")
}