// jobs/runJob.js
import { jobRegistry } from "./runJob.js";

export async function runJob(name) {
  const job = jobRegistry[name];

  if (!job) {
    throw new Error(`Job ${name} não encontrado`);
  }

  console.log(`[JOB] Iniciando ${name}`);

  const start = Date.now();

  await job();

  console.log(`[JOB] Finalizado ${name} em ${Date.now() - start}ms`);
}