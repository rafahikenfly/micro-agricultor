import { sqlDb } from "../../../infra/index.js";

// ==========================
// Statements preparados
// ==========================
const insertStmt = sqlDb.prepare(`
  INSERT INTO sensores_log 
  (entidade_id, caracteristica_id, valor, data_hora, msg_id)
  VALUES (?, ?, ?, ?, ?)
`);

const sumStmt = sqlDb.prepare(`
  SELECT SUM(valor) as result
  FROM sensores_log
  WHERE caracteristica_id = ?
  AND data_hora BETWEEN ? AND ?
`);

const avgStmt = sqlDb.prepare(`
  SELECT AVG(valor) as result
  FROM sensores_log
  WHERE caracteristica_id = ?
  AND data_hora BETWEEN ? AND ?
`);

const minStmt = sqlDb.prepare(`
  SELECT MIN(valor) as result
  FROM sensores_log
  WHERE caracteristica_id = ?
  AND data_hora BETWEEN ? AND ?
`);

const maxStmt = sqlDb.prepare(`
  SELECT MAX(valor) as result
  FROM sensores_log
  WHERE caracteristica_id = ?
  AND data_hora BETWEEN ? AND ?
`);

// COUNT ajustado para retornar NULL quando não houver dados
const countStmt = sqlDb.prepare(`
  SELECT CASE 
    WHEN COUNT(*) = 0 THEN NULL 
    ELSE COUNT(*) 
  END as result
  FROM sensores_log
  WHERE caracteristica_id = ?
  AND data_hora BETWEEN ? AND ?
`);


// ==========================
// Helpers
// ==========================

function getNullableNumber(res) {
  return res?.result === null || res?.result === undefined
    ? null
    : Number(res.result);
}


// ==========================
// Funções públicas
// ==========================

export function armazenarMedidaDeCaracteristica({ entidadeId, caracteristicaId, timestamp, valor, msgId }) {
  insertStmt.run(
    entidadeId,
    caracteristicaId,
    valor,
    timestamp ?? Date.now(),
    msgId
  );
}

export function somaPorCaracteristicaNoPeriodo(id, inicio, fim) {
  return getNullableNumber(sumStmt.get(id, inicio, fim));
}

export function mediaPorCaracteristicaNoPeriodo(id, inicio, fim) {
  return getNullableNumber(avgStmt.get(id, inicio, fim));
}

export function minPorCaracteristicaNoPeriodo(id, inicio, fim) {
  return getNullableNumber(minStmt.get(id, inicio, fim));
}

export function maxPorCaracteristicaNoPeriodo(id, inicio, fim) {
  return getNullableNumber(maxStmt.get(id, inicio, fim));
}

export function countPorCaracteristicaNoPeriodo(id, inicio, fim) {
  return getNullableNumber(countStmt.get(id, inicio, fim));
}