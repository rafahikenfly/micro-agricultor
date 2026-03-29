import fs from "fs";

const LOG_FILE = "/home/cyberlavrador2/scripts/backend.log"; //RASP
//const LOG_FILE = "/Users/rcmachado/Documents/backend.log" //MACBOOK


export function log(...args) {
  const message = `[${new Date().toISOString()}] ${args.join(" ")}`;
  
  console.log(message);
  fs.appendFile(LOG_FILE, message + "\n", (err) => {
    if (err) console.error("Erro ao escrever log:", err);
  });
}