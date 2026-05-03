import { criarEvento, ESTADO_TAREFA, EVENTO, monitorar, ORIGEM } from "micro-agricultor";
import { batchService, cacheService, eventosService, midiasService, mutacoesService, necessidadesService, plantasService } from "../services/index.js";
import { log } from "../core/logger/index.js";
import { executarModeloPython } from "../core/python/index.js";
import { baixarImagem } from "../../frontend/src/utils/blobUtils.js";

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
    origem: {
      id: "mediaTaskInspector",
      tipo: ORIGEM.BACKEND.id
    },
    entidadesKey: [],
  })
  const entidadesKeySet = new Set();
  evento.id = eventoId;
  let commitEvento = false;

  //Monta o batch
  let batch = batchService.create();

  const medidas =  {
//   [entidadeId]: {
//     [caracteristicaId]: {
//       valor: number,
//       confianca?: number
//     }
//   }
  }

  // Processa cada imagem
  for (const midia of imagensPendentes) {
    await batch.commitIfNeeded();
    const {tipoEntidadeId, entidadeId} = midia.contexto;
    if (!tipoEntidadeId) {console.warn (`Mídia ${midia.id} sem tipoEntidadeId no contexto`); continue};
    if (!entidadeId) {console.warn (`Mídia ${midia.id} sem entidadeId no contexto`); continue};

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

    // Prepara a execução
    const resultados = {};
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

    // Se houver modelos aplicáveis, adiciona a entidade no Set
    if (!modelosAplicaveis.length) continue
    const caminhoLocal = await baixarImagem(midia.metadados.url);            

    // Roda os modelos aplicáveis
    for (const modelo of modelosAplicaveis) {
      // Se o modelo não tem classes registradas, nem deve rodar.
      if (!modelo.classes) {console.warn (`Modelo ${modelo.nome} sem classes cadastradas`); continue}


      medidas[entidadeId] = medidas[entidadeId] || {}
      const resultado = await executarModeloPython(caminhoLocal, modelo.path);
      const detections = resultado?.detections || {}
      const confidence = resultado?.confidence || {}

      for (const classeObj of Object.values(modelo.classes)) {
        // Nem toda classe tem caracteristicaId mapeada
        if (!classeObj?.caracteristicaId || !classeObj?.classe) {console.warn (`Erro no cadastro da classe do modelo.`); continue}

        // Registrar mutações da inferência
        const classe = classeObj.classe
        if (detections[classe] === undefined) {
          console.warn (`Detecção da classe ${classe} indefinida.`);
          continue;
        }
        medidas[entidadeId][classeObj.caracteristicaId] = {
          valor: detections[classe].count ?? 0,
          confianca: detections[classe].confidence * 100 ?? 0
        }
      }
    // TODO: Resolver erros
    // TODO: Rotear a imagem original e anotada
      resultados[modelo.id] = resultado.detections;
    }

    execucao.finalizadoEm = Date.now();
    entidadesKeySet.add(`${tipoEntidadeId}:${entidadeId}`);
    commitEvento = true;

    // Marca imagem como processada
    midia.estado = ESTADO_TAREFA.FEITO.id;
    midia.execucao = execucao;
    midia.inferencia = {
      processada: Object.keys(resultados).length > 0,
      resultados,
    };

    const midiaRef = midiasService.getRefById(midia.id);
    batch.add((b)=>midiasService.batchUpdate(midiaRef, midia, user, b));

    monitorar({
      tipoEntidadeId,
      entidades: [mapas[tipoEntidadeId].get(entidadeId)],
      medidas,
      timestamp,
      user,
      services: {
        batch: batchService,
        entidade: plantasService,
        eventos: eventosService,
        mutacoes: mutacoesService,
        necessidades: necessidadesService,
      }
    })

  };
  // =========
  // Finaliza o evento de inferência
  // =========
  if (commitEvento) {
    evento.entidadesKey = Array.from(entidadesKeySet);
    batch.add((b)=>eventosService.batchUpsert(eventoRef, evento, user, b));
  }
  await batch.commit();

  log("[mediaTaskInspector]: Inspeção de tarefas de mídia concluída.")
}