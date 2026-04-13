import fs from "fs";
export * from "./store.js";

const LOG_FILE = "backend.log"


export function log(...args) {
  const message = `[${new Date().toISOString()}] ${args.join(" ")}`;
  
  fs.appendFile(LOG_FILE, message + "\n", (err) => {
    if (err) console.error("Erro ao escrever log:", err);
  });
}