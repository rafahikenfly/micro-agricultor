import fs from "fs";

const store = {};

export function armazenarDado({entidadeId, caracteristicaId, timestamp, valor, msgId}) {
/* ESSE TRECHO RECUPERA OS DADOS 
  if (!store[entidadeId]) {
    store[entidadeId] = {};
  }

  if (!store[entidadeId][caracteristicaId]) {
    store[entidadeId][caracteristicaId] = {};
  }

  store[entidadeId][caracteristicaId][timestamp] = valor;
 */
  fs.appendFile(
    "sensores.log",
    JSON.stringify({ entidadeId, caracteristicaId, timestamp, valor, msgId }) + "\n",
    () => {}
  );
}