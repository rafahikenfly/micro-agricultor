import { log } from "./core/logger/index.js";
import { startMQTT } from "./core/mqtt/index.js";
import { dailyMaintenance, hourlyMaintenance, refreshCriticalCaches } from "./scheduler/dailyMaintenance.js";

// Tempo real
log("Iniciando tarefas em tempo real...");
startMQTT();

// Scheduler
log("Iniciando tarefas agendadas...");
dailyMaintenance();
hourlyMaintenance();
refreshCriticalCaches();

log("Backend online 🚀");
