import { log } from "./core/logger/index.js";
import { startMQTT } from "./core/mqtt/index.js";
import { supervisorTarefas } from "./listener/supervisorTarefas.js";
import { runJob } from "./pipeline/runJob.js";
import {
  dailyMaintenance,
  hourlyMaintenance,
  refreshCriticalCaches
} from "./scheduler/dailyMaintenance.js";
import { cacheService } from "./services/cache.js";

const args = process.argv.slice(2);

const jobIndex = args.indexOf("--job");
const jobName = jobIndex !== -1 ? args[jobIndex + 1] : null;

async function main() {
  if (jobName) {
    log(`Executando: ${jobName}`);
    await runJob(jobName);
    return;
  }

  
  // Fluxo normal
  const dispositivos = await cacheService.getDispositivos()

  log("Assinando mqtt...");
  startMQTT(dispositivos);


  log("Iniciando listeners...");
  await supervisorTarefas();

  
  log("Iniciando tarefas agendadas...");
  dailyMaintenance();
  hourlyMaintenance();
  refreshCriticalCaches();


  log("Backend online 🚀");
}

main();