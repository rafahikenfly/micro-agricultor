import { ENTIDADE, EVENTO, getNecessidadeKey, monitorar, ORIGEM } from "micro-agricultor";
import { batchService, cacheService, entidadesService, eventosService, mutacoesService, necessidadesService } from "../../services/index.js";
import { log, armazenarDado } from "../logger/index.js";
import { ACUMULACAO } from "micro-agricultor/types/ACUMULACAO.js";
import { countPorCaracteristicaNoPeriodo, maxPorCaracteristicaNoPeriodo, minPorCaracteristicaNoPeriodo, somaPorCaracteristicaNoPeriodo } from "../logger/sql/index.js";

export async function handleDispositivo(topic, message) {
  const user = { uid: "handleDispositivo", nome: ORIGEM.BACKEND.id };
  const timestamp = Date.now();

  // obtém e prepara dados
  const [
    cacheNecessidades,
    cacheDispositivos,
    cacheCaracteristicas,
    cachePlantas,
    cacheCanteiros
  ] = await Promise.all([
    cacheService.getNecessidades(),
    cacheService.getDispositivos(),
    cacheService.getCaracteristicas(),
    cacheService.getPlantas(),
    cacheService.getCanteiros(),
  ]);
  const entidadeCaches = {
    [ENTIDADE.planta.id]: cachePlantas,
    [ENTIDADE.canteiro.id]: cacheCanteiros,
  }
  const entidadesPorTipo = {};


  // recupera config do dispositivo
  const dispositivoId = topic.split("/")[1];
  const dispositivo = cacheDispositivos.map.get(dispositivoId)
  if (!dispositivo) {
    log(`[handleDispostivo]: Dispositivo ${dispositivoId} não cadastrado.`);
    return;
  }

  // processa o payload
  try {
    const payload = JSON.parse(message.toString());
    const { sensores } = dispositivo;
    
    for (const msgId in payload) {
      const valores = payload[msgId];
  
      if (!Array.isArray(valores)) {
        log(`[handleDispostivo]: 'Valores' do payload não é array.`);
        continue;
      }
  
      valores.forEach((valor, index) => {
log(`[handleDispostivo]: ${valor} ${index}.`);

        // prepara a interpretacao, verificando o cadastro do sensor
        // no cache.
        const sensor = sensores[index];  
        if (!sensor) {
          log(`[handleDispositivo]: Valor não mapeado em sensor no índice ${index} no dispositivo ${dispositivoId}`);
          return;
        }
        const { tipoEntidadeId, entidadeId, caracteristicaId, confianca } = sensor;
        if (!tipoEntidadeId) {
          log(`[handleDispositivo]: Sensor ${index} do dispositivo ${dispositivoId} sem tipoEntidadeId.`);
          return;
        }
        if (!entidadeId) {
          log(`[handleDispositivo]: Sensor ${index} do dispositivo ${dispositivoId} sem entidadeId.`);
          return;
        }
        if (!caracteristicaId) {
          log(`[handleDispositivo]: Sensor ${index} do dispositivo ${dispositivoId} sem caracteristicaId.`);
          return;
        }
        if (confianca == null) { // == para null e undefined
          log(`[handleDispositivo]: Sensor ${index} do dispositivo ${dispositivoId} sem confianca definida.`);
          return;
        }
        // armazena os dados
        armazenarDado({
          entidadeId,
          timestamp,
          caracteristicaId,
          valor,
          msgId
        });

        // Verifica a necessidade de monitoramento e se houver, inclui
        // no objeto que vai ser iterado para monitoramento. Isso só funciona
        // para características sem acumulação. Características com acumulação
        // devem ser processadas pelo inspetor
        const caracteristica = cacheCaracteristicas.map.get(caracteristicaId)
        if (!caracteristica) return;

        const inicio = timestamp - caracteristica.tempoAcumulacao;
        let valorAcumulado = valor;

        switch (caracteristica.tipoAcumulacaoId) {
          case ACUMULACAO.NENHUM.id:
            break;
          case ACUMULACAO.SOMA.id:
            valorAcumulado = somaPorCaracteristicaNoPeriodo(caracteristicaId, inicio, timestamp);
            break;
          case ACUMULACAO.MAXIMO.id:
            valorAcumulado = maxPorCaracteristicaNoPeriodo(caracteristicaId, inicio, timestamp);
            break;
          case ACUMULACAO.MINIMO.id:
            valorAcumulado = minPorCaracteristicaNoPeriodo(caracteristicaId, inicio, timestamp);
            break;
          case ACUMULACAO.AMPLITUDE.id: {
            const min = minPorCaracteristicaNoPeriodo(caracteristicaId, inicio, timestamp);
            const max = maxPorCaracteristicaNoPeriodo(caracteristicaId, inicio, timestamp);
            valorAcumulado = (min === null || max === null) ? null : (max - min);
            break;
          }
          case ACUMULACAO.CONTAR.id: {
            // aqui depende da regra (ex: contar acima de um threshold)
            const count = countPorCaracteristicaNoPeriodo(caracteristicaId, inicio, timestamp);
            valorAcumulado = count;
            break;
          }

          default:
            log(`[handleDispositivo]: Acumulador ${caracteristica.tipoAcumulacaoId} da caracteristica ${caracteristica.id} desconhecido`);
            valorAcumulado = null;
        }
        if (!valorAcumulado) return;
            log(`[handleDispositivo]: Acumulador acumulou ${valorAcumulado}.`);

        const necessidadeKey = getNecessidadeKey({
          entidadeId,
          caracteristicaId,
          tipoEventoId: EVENTO.MONITORAMENTO.id,
        });
        const necessidade = cacheNecessidades.map.get(necessidadeKey);
        if (necessidade && necessidade.ativo) {
          const grupo = entidadesPorTipo[tipoEntidadeId] ||= {
            entidades: new Map(),
            medidas: {}
          };
          
          // recupera a entidade se ainda não está no map
          let entidade = grupo.entidades.get(entidadeId);
          if (!entidade) {
            entidade = entidadeCaches[tipoEntidadeId].map.get(entidadeId);
            if (!entidade) return;

            grupo.entidades.set(entidadeId, entidade);
          }

          // adiciona medida no objeto
          grupo.medidas[entidadeId] ||= {};
          grupo.medidas[entidadeId][caracteristicaId] = {
            valorAcumulado,
            confianca
          };  
        }
      });
    }
    log(`[handleDispositivo]: Mensagem processada.`);
  } catch (err) {
    log(`[handleDispositivo]: Erro processando o payload ${message.toString()}: `, err);
    return;
  }
  // no fim, itera sobre o objeto de necessidades para fazer o monitoramento
  // OBS: registro do atendimento de necessidade e conclusão de tarefas não é
  // feito aqui, mas na aplicação de monitoramento! O único cuidado que tenho
  // que tomar aqui é zerar o cache de necessidades.
  let limparCacheNecessidades = false;
  for (const tipoEntidadeId in entidadesPorTipo) {
    const { entidades, medidas } = entidadesPorTipo[tipoEntidadeId];
log(`[handleDispostivo]: ${tipoEntidadeId} ${entidades} ${medidas}.`);

    if (Object.keys(medidas).length === 0) continue;
    if (!entidadesService(tipoEntidadeId)) continue;
    log(`[handleDispositivo]: Monitorando ${Object.keys(medidas).length} medida(s) de ${tipoEntidadeId}(s) a partir do MQTT`);
    await monitorar({
      tipoEntidadeId,
      entidades: Array.from(entidades.values()),
      medidas,
      timestamp,
      user,
      services: {
        batch: batchService,
        eventos: eventosService,
        entidade: entidadesService(tipoEntidadeId),
        mutacoes: mutacoesService,
        necessidades: necessidadesService,
      },
    });
    limparCacheNecessidades = true;
  }
  if (limparCacheNecessidades) cacheService.clearCache("necessidades")
}