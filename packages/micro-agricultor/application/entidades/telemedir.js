export async function telemedir({
    services,
    entidade,
    estado,
    timestamp,
    user,
}) {
  // ======
  // Validações
  // ======
  if (!estado) {
    throw new Error("Nenhum novo estado.");
  }
  if (!entidade) {
    throw new Error("Entidade telemedida não informada.");
  }
  if (!entidade.telemetria) {
    throw new Error("Entidade sem telemetria.");
  }
  if (!timestamp) {
    throw new Error("Timestamp da telemetria não informada.");
  }

  const novaTelemetria = {
    ...estado,
    ts: timestamp,
  };

  entidade.telemetria = estado;
  entidade.telemetria.ts = timestamp;
  return services.entidade.update(
    services.entidade.getRefById(entidade.id),
    {telemetria: novaTelemetria},
    user,
  )
}
