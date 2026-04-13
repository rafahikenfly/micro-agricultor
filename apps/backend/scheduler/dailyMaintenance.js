// efeitos/dailyMaintenance.scheduler.js

import cron from "node-cron";
import { dailyEvolution } from "./dailyEvolution.js";
import { runJob } from "../pipeline/runJob.js";
import { log } from "../core/logger/index.js";


const dailyTasks = [
  { name: "mediaStateInspect", },
];

const hourlyTasks = [
  { name: "currentStateInspector" },
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
  log("[CRON] dailyMaintenance agendado para 03:00");

  cron.schedule("15 3 * * *", async () => {
    log("[dailyMaintenance] Iniciando manutenção diária...");

    try {
      await dailyEvolution();
    } catch (err) {
      log("ERROR - [dailyMaintenance] Erro em dailyEvolution:", err);
    }

    await runTasks(dailyTasks, "dailyMaintenance");

    log("[dailyMaintenance] Finalizado");
  });
}

export function hourlyMaintenance() {
  log("[CRON] hourlyMaintenance agendado para cada hora");

  cron.schedule("0 * * * *", async () => {
    log("[hourlyMaintenance] Iniciando manutenção horária...");

    await runTasks(hourlyTasks, "hourlyMaintenance");

    log("[hourlyMaintenance] Finalizado");
  });
}