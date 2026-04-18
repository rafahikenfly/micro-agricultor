import { log } from "../core/logger/index.js";
import { jobRegistry } from "./jobRegistry.js";

export async function runJob(name) {
  const job = jobRegistry[name];

  if (!job) {
    throw new Error(`Job ${name} não encontrado`);
  }

  log(`[JOB] Iniciando ${name}`);
  const start = Date.now();
  await job();

  log(`[JOB] Finalizado ${name} em ${Date.now() - start}ms`);
}