import fs from "fs";
export * from "./store.js";

const LOG_FILE = "backend.log"


export function log(...args) {
  const now = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
  });

  const message = `[${now}] ${args.join(" ")}`;
  
  fs.appendFile(LOG_FILE, message + "\n", (err) => {
    if (err) console.error("Erro ao escrever log:", err);
  });
}