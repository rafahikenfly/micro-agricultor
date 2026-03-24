import { dailyMaintenance } from "./scheduler/dailyMaintenance";

console.log("Backend iniciado 🚀");
console.log("Iniciando tarefas agendadas...");
dailyMaintenance(); //TODO: lock para evitar duplicação

console.log("Tarefas agendadas inicializadas...");