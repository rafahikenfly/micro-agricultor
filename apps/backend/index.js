import { log } from "./core/logger/index.js";
import { startMQTT } from "./core/mqtt/index.js";
import { runJob } from "./pipeline/runJob.js";
import {
  dailyMaintenance,
  hourlyMaintenance,
  refreshCriticalCaches
} from "./scheduler/dailyMaintenance.js";

const args = process.argv.slice(2);

const jobIndex = args.indexOf("--job");
const jobName = jobIndex !== -1 ? args[jobIndex + 1] : null;

async function main() {
  if (jobName) {
    log(`Executando: ${jobName}`);
    await runJob(jobName);
    return;
  }

  // fluxo normal
  log("Iniciando tarefas em tempo real...");
  startMQTT();

  log("Iniciando tarefas agendadas...");
  dailyMaintenance();
  hourlyMaintenance();
  refreshCriticalCaches();

  log("Backend online 🚀");
}

main();