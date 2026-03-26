import { log } from "./core/logger/index.js";
import { dailyMaintenance } from "./scheduler/dailyMaintenance.js";

log("Backend iniciado 🚀");
log("Iniciando tarefas agendadas...");
dailyMaintenance(); //TODO: lock para evitar duplicação

log("Tarefas agendadas inicializadas...");