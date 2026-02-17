export const montarLogEvento = ({tipoEventoId, alvos, origemId, origemTipo, data = {}}) => {
  if (!tipoEventoId) throw new Error ("Erro montando log: tipoEventoId obrigatório.")
  if (!alvos) throw new Error ("Erro montando log: entidadeId obrigatório.")
  if (!origemId) throw new Error ("Erro montando log: origemId obrigatório.")
  if (!origemTipo) throw new Error ("Erro montando log: origemTipo obrigatório.")

  return {
    ...data,
    tipoEventoId,
    alvos,
    origemId,
    origemTipo,
  }
}

export const montarEfeitoHistorico = ({eventoId, tipoEventoId, entidadeId, entidadeTipoId, caracteristicaId, estadoAntes, estadoDepois, createdAt, data = {}}) => {
  if (!eventoId) throw new Error ("Erro montando lista de efeitos: eventoId obrigatório.")
  if (!tipoEventoId) throw new Error ("Erro montando lista de efeitos: tipoEventoId obrigatório.")
  if (!entidadeId) throw new Error ("Erro montando lista de efeitos: entidadeId obrigatório.")
  if (!entidadeTipoId) throw new Error ("Erro montando lista de efeitos: entidadeTipoId obrigatório.")
  if (!caracteristicaId) throw new Error ("Erro montando lista de efeitos: caracteristicaId obrigatório.")
  if (!estadoAntes) throw new Error ("Erro montando lista de efeitos: estadoAntes obrigatório.")
  if (!estadoDepois) throw new Error ("Erro montando lista de efeitos: estadoDepois obrigatório.")
  if (!createdAt) throw new Error ("Erro montando lista de efeitos: createdAt obrigatório.")

    return {
    ...data,
    tipoEventoId,
    caracteristicaId,
    confiancaAntes: estadoAntes?.confianca ?? 0,
    confiancaDepois: estadoDepois?.confianca ?? 0,
    valorAntes: estadoAntes?.valor ?? 0,
    valorDepois: estadoDepois.valor ?? 0,
    entidadeId,
    entidadeTipoId,
    eventoId,
    createdAt,
  }
}

export const calcularEfeitosDoEvento = ({entidadeId, eventoId, tipoEventoId, estadoAntes, estadoDepois, tipoEntidadeId, createdAt}) => {
  if (!entidadeId) throw new Error ("Erro calculando efeitos do evento: entidadeId obrigatório.")
  if (!eventoId) throw new Error ("Erro calculando efeitos do evento: eventoId obrigatório.")
  if (!tipoEventoId) throw new Error ("Erro calculando efeitos do evento: eventoId obrigatório.")
  if (!estadoAntes) throw new Error ("Erro calculando efeitos do evento: estadoAntes obrigatório.")
  if (!estadoDepois) throw new Error ("Erro calculando efeitos do evento: estadoDepois obrigatório.")
  if (!tipoEntidadeId) throw new Error ("Erro calculando efeitos do evento: tipoEntidadeId obrigatório.")
  if (!createdAt) throw new Error ("Erro calculando efeitos do evento: createdAt obrigatório.")
  
    
    const efeitosDoEvento = [];
    for (const caracteristicaId of Object.keys(estadoDepois)) {
    // Se há diferença, adiciona ao rol de efeitos do evento
    const antes = estadoAntes?.[caracteristicaId] ?? {confianca: 0, valor: 0};
    const depois = estadoDepois?.[caracteristicaId] ?? {confianca: 0, valor: 0};
    if (antes.confianca !== depois.confianca || antes.valor !== depois.valor)
      efeitosDoEvento.push(montarEfeitoHistorico({
        eventoId: eventoId,
        tipoEventoId: tipoEventoId,
        entidadeId: entidadeId,
        entidadeTipoId: tipoEntidadeId,
        caracteristicaId: caracteristicaId,
        estadoAntes: antes,
        estadoDepois: depois,
        createdAt: createdAt,
    }));
  }
  return efeitosDoEvento;
}

export async function processarEventoComEfeitos({
  tipoEventoId,
  origem,               // { id, tipo }
  alvos,                // [{ data, tipoEntidadeId }]
  regra,                // (input) => novaEntidade
  contexto = {},        // medidas, tecnica, etc
  user,
  db,
  services,             // { eventosService, historicoEfeitosService, entidadeService }
  createdAt,
}) {
  if (!tipoEventoId) throw new Error ("Erro processando evento com efeitos: tipoEventoId obrigatório.")
  if (!origem) throw new Error ("Erro processando evento com efeitos: origem obrigatório.")
  if (!alvos) throw new Error ("Erro processando evento com efeitos: alvos obrigatório.")
  if (!regra) throw new Error ("Erro processando evento com efeitos: regra obrigatório.")
  if (!contexto) throw new Error ("Erro processando evento com efeitos: contexto obrigatório.")
  if (!user) throw new Error ("Erro processando evento com efeitos: user obrigatório.")
  if (!db) throw new Error ("Erro processando evento com efeitos: db obrigatório.")
  if (!services) throw new Error ("Erro processando evento com efeitos: services obrigatório.")
  if (!createdAt) throw new Error ("Erro processando evento com efeitos: createdAt obrigatório.")


  const batch = db.batch();
  let opCount = 0;
  // cria evento ref
  const eventoRef = services.eventosService.criarRef();

  const evento = montarLogEvento({
    tipoEventoId,
    origemId: origem.id,
    origemTipo: origem.tipo,
    alvos: alvos.map(a => ({
      id: a.data.id,
      tipoEntidadeId: a.tipoEntidadeId
    })),
    data: {
      efeitos: [],
    }
  });

  // Para cada entidade-alvo
  for (const alvo of alvos) {
    const { data: entidade, tipoEntidadeId } = alvo;
    const entidadeRef = services.entidadeService.getRefById(entidade.id)

    // aplica regra de domínio
    const entidadeDepois = regra({
      [tipoEntidadeId]: entidade,
      eventoId: eventoRef.id,
      ...contexto,
    });

    // pula entidade caso não haja resultado da regra aplicada
    if (!entidadeDepois) {
      console.log(`Sem alteração para ${tipoEntidadeId} ${entidade.nome}`)
      continue;
    }

    // calcula efeitos
    const efeitos = calcularEfeitosDoEvento({
      entidadeId: entidade.id,
      eventoId: eventoRef.id,
      tipoEventoId,
      estadoAntes: entidade?.estadoAtual || {},
      estadoDepois: entidadeDepois.estadoAtual,
      tipoEntidadeId,
      createdAt: createdAt,
    });

    if (efeitos.length === 0) {
      console.log(`Sem efeitos para ${tipoEntidadeId} ${entidade.nome}`)
      continue;
    }
    // atualiza estado da entidade
    services.entidadeService.batchUpdate(
      entidadeRef, 
      { estadoAtual: entidadeDepois.estadoAtual, },
      user,
      batch
    );
    opCount++;

    // cria o histórico de cada efeito
    efeitos.forEach(efeito => {
      services.historicoEfeitosService.batchCreate(efeito, user, batch);
      opCount++;
    });

    // adiciona efeitos no evento
    evento.efeitos.push(...efeitos);
  }

  // salva evento
  services.eventosService.batchUpsert(eventoRef, evento, user, batch);
  opCount++;

  await batch.commit();

  return { evento, opCount };
}
