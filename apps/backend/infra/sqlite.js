import Database from "better-sqlite3";

export const sqlDb = new Database("sensores.db");

// cria tabela se não existir
sqlDb.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
`);
sqlDb.exec(`
  CREATE TABLE IF NOT EXISTS sensores_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entidade_id INTEGER,
    caracteristica_id INTEGER,
    valor REAL,
    data_hora INTEGER,
    msg_id TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_lookup 
  ON sensores_log (caracteristica_id, data_hora);
`);