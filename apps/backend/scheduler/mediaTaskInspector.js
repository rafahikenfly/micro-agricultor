import { criarEvento, ESTADO_TAREFA, EVENTO, ORIGEM } from "micro-agricultor";
import { batchService, cacheService, eventosService, midiasService } from "../services/index.js";
import { log } from "../core/logger/index.js";
import { executarModeloPython } from "../core/python/index.js";

export async function mediaTaskInspector() {
  log("[mediaTaskInspector]: Iniciando inspeção de tarefas de mídia...")
  const user = { uid: "mediaTaskInspector", nome: ORIGEM.BACKEND.id };

  // Obtem as imagens pendentes de processamento
  const imagensPendentes = (await cacheService
    .getMidias())
    .list
    .filter((m) => m.estado === ESTADO_TAREFA.PENDENTE.id);

  if (!imagensPendentes.length) {
    log("[mediaTaskInspector]: Nenhuma imagem pendente processamento");
    return
  }

  const modelos = (await cacheService.getModelosCV()).list
  const plantas = (await cacheService.getPlantas()).map
  const canteiros = (await cacheService.getCanteiros()).map

  const mapas = {
    planta: plantas,
    canteiro: canteiros,
  }

  // =========
  // Inicaliza o evento
  // =========
  const eventoRef = eventosService.getAppendRef();
  const eventoId = eventoRef.id;
  const timestamp = Date.now();
  const evento = criarEvento({
  tipoEvento: EVENTO.INFERENCIA,
  timestamp,
  origem: {id: "mediaTaskInspector", tipo: ORIGEM.BACKEND.id},
  entidadesKey: [],
  })
  const entidadesKeySet = new Set();
  evento.id = eventoId;
  let commitEvento = false;

  //Monta o batch
  let batch = batchService.create();

  // Processa cada imagem
  for (const midia of imagensPendentes) {
    await batch.commitIfNeeded();
    const {tipoEntidadeId, entidadeId} = midia.contexto;

    // Obtem modelos aplicaveis
    // modelo precisa ser do mesmo tipos de entidade
    // modelo generalista
    // modelo especialista da entidade por key, valor
    const modelosAplicaveis = modelos.filter((modelo) => {
      if (!modelo.ativo) return false;
      if (modelo.tipoEntidadeId !== tipoEntidadeId) return false;
      if (modelo.especialista === false) return true;
      if (modelo.especialista === true) {
        const entidade = mapas[tipoEntidadeId].get(entidadeId)
        if (!entidade) return false;
        return (
          entidade[modelo.especialidadeKey] === modelo.especialidadeValor
        );
      }
      return false;
    });


    // Placeholder de execução
    const modelosId = [];
    const start = Date.now()
    const execucao = {
      adquiridaEm: start,
      adquiridaAte: start + 10000,
      iniciadoEm: start,
      finalizadoEm: null,
      tentativas: 1,
      ultimoErro: null,
      maxTentativas: 3,
    };
    for (const modelo of modelosAplicaveis) {
      const resultado = await executarModeloPython(midia.path, modelo.path);
      console.log(`TODO: Registrar mutações da inferência`);    // placeholder
      modelosId.push(modelo.id);
    }
    if (modelosId.length) {
        execucao.finalizadoEm = Date.now();
        entidadesKeySet.add(`${tipoEntidadeId}:${entidadeId}`);
        commitEvento = true;
    }

    // Marca imagem como processada
    midia.estado = ESTADO_TAREFA.FEITO.id;
    midia.execucao = execucao;
    midia.inferencia = {
      processada: modelosId.length > 0,
      modelosId: modelosId,
      resultados: {},
      confiancaMedia: null,
    };

    const midiaRef = midiasService.getRefById(midia.id);
    batch.add((b)=>midiasService.batchUpdate(midiaRef, midia, user, b));
  };
  // =========
  // Finaliza o evento
  // =========
  if (commitEvento) {
    evento.entidadesKey = Array.from(entidadesKeySet);
    batch.add((b)=>eventosService.batchUpsert(eventoRef, evento, user, b));
  }

  await batch.commit();


  log("[mediaTaskInspector]: Inspeção de tarefas de mídia concluída.")
}