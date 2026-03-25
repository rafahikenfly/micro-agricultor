import { dailyMaintenance } from "./scheduler/dailyMaintenance.js";

console.log("Backend iniciado 🚀");
console.log("Iniciando tarefas agendadas...");
dailyMaintenance(); //TODO: lock para evitar duplicação

console.log("Tarefas agendadas inicializadas...");