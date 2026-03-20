import { VALUE_EFFECT_TYPES } from "../types/VALUE_EFFECT_TYPES";

export function monitorarEstadoAtual({entidade, medidas, eventoId, timestamp}) {
  if (!entidade) throw new Error ("monitorarEstadoAtual: entidade obrigatório.")
  if (!medidas) throw new Error ("monitorarEstadoAtual: caracteristicasMedidas obrigatório.")
  if (!eventoId) throw new Error ("monitorarEstadoAtual: eventoId obrigatório.")
  if (!timestamp) throw new Error("monitorarEstadoAtual: timestamp obrigatório");

  // Cria uma cópia do canteiro para não modificar o original, garantindo a existencia da chave estadoAtual
  const entidadeManejada = {
    ...entidade,
    estadoAtual: {
      ...(entidade.estadoAtual ?? {})
    },
  };
  const before = {}
  const after = {}

  // Processa as medidas da medicao
  Object.entries(medidas).forEach(([caracteristicaId, medida]) => {
    // Garante que a característica exista no estadoAtual
    before[caracteristicaId] = {...(entidadeManejada.estadoAtual[caracteristicaId] ?? {})}
    after[caracteristicaId] = {
      valor: medida.valor,          // Reinicializa o valor
      confianca: medida.confianca,  // Reinicializa a confiança
      eventos: [eventoId],          // Reinicializa eventos com a medição
      manejos: [],                  // Limpa manejos anteriores após medição
      calculadoEm: timestamp,
    }
    // Reinicializa apenas a característica com a medida
    entidadeManejada.estadoAtual[caracteristicaId] = {...after[caracteristicaId]}
  });
  return {entidadeManejada, before, after};
}


export const manejarEntidade = ({entidade, manejo, eventoId, timestamp}) => {  //entradas: CONSIDERAR AS ENTRADAS DO MANEJO
  if (!entidade) throw new Error ("manejarEstadoAtual: entidade obrigatória.")
  if (!manejo) throw new Error ("manejarEstadoAtual: manejo obrigatório.")
  if (!eventoId) throw new Error ("manejarEstadoAtual: eventoId obrigatório.")
  if (!timestamp) throw new Error ("manejarEstadoAtual: timestamp obrigatório.")

  // Cria uma cópia da entidade para não modificar a original, garantindo a existencia da chave estadoAtual
  const entidadeManejada = {
    ...entidade,
    estadoAtual: {
      ...(entidade.estadoAtual ?? {}),
    },
  };
  const before = {};
  const after = {};

  // Atualiza o estado de destino da entidade conforme o manejo
  // Só há mudança de estado se a entidade estiver no estado de origem
  // E houver um estado de destino
  if (manejo.estadoDestinoId && entidade.estado === manejo.estadoOrigemId) {
    entidadeManejada.estadoId = manejo.estadoDestinoId;
    entidadeManejada.estadoNome = manejo.estadoDestinoNome;

    //TODO: Salvar no after a mudança de estado
  }

  // Processa os efeitos do manejo
  if (Array.isArray(manejo.efeitos)) {
    for (const efeito of manejo.efeitos) {
      // Garante que a característica exista no estadoAtual e salva no before
      const atual = entidadeManejada.estadoAtual[efeito.caracteristicaId] ?? {valor: 0, confianca: 0};
      before[efeito.caracteristicaId] = {
        valor: atual.valor ?? null,
        confianca: atual.confianca ?? null,
      };


      //TODO: PROCESSAR AS ENTRADAS DO MANEJO

      
      let novoValor = atual.valor;
      // Calcula o novo valor conforme o tipo
      switch (efeito.tipoEfeitoValorId) {
        case VALUE_EFFECT_TYPES.NONE: break;
        case VALUE_EFFECT_TYPES.DELTA: novoValor += Number(efeito.efeitoValor); break;
        case VALUE_EFFECT_TYPES.MULTIPLIER:  novoValor *= Number(efeito.efeitoValor); break;
        case VALUE_EFFECT_TYPES.FIXED: novoValor = Number(efeito.efeitoValor); break;
        default:
          throw new Error( `Tipo de efeito sobre valor ${efeito.tipoEfeitoValorId} inválido no manejo ${manejo.nome} (${manejo.id})` );
      }
      let novaConfianca = atual.confianca;
      // Calcula o novo valor conforme o tipo
      switch (efeito.tipoEfeitoConfiancaId) {
        case VALUE_EFFECT_TYPES.NONE: break;
        case VALUE_EFFECT_TYPES.DELTA: novaConfianca += Number(efeito.efeitoConfianca); break;
        case VALUE_EFFECT_TYPES.MULTIPLIER:  novaConfianca *= Number(efeito.efeitoConfianca); break;
        case VALUE_EFFECT_TYPES.FIXED: novaConfianca = Number(efeito.efeitoConfianca); break;
        default:
          throw new Error( `Tipo de efeito sobre confiança ${efeito.tipoEfeitoConfiancaId} inválido no manejo ${manejo.nome} (${manejo.id})` );
      }

      // Atualiza a característica com novos valores, incluindo novo evento na lista
      entidadeManejada.estadoAtual[efeito.caracteristicaId] = {
        ...atual,
        valor: novoValor,                             // Novo valor da característica
        confianca: novaConfianca,                     // Nova confiança da característica (se houver)
        manejos: [...(atual.manejos ?? []), eventoId],// Adiciona manejos aos anteriores
        // TODO: se um manejo tiver duas vezes a mesma caracteristica na lista de efeitos,
        // o manejo aparecerá duplicado aqui. Isso precisa ser controlado melhor fora do loop
        // ou com um array paralelo.
        calculadoEm: timestamp,
      };

      // Salva no after
      after[efeito.caracteristicaId] = {
        valor: novoValor,
        confianca: novaConfianca,
      };
    };
  }
  //TODO: criar a regra de manejo independente de entidade, assim como foi feito no monitoramento.
  return {entidadeManejada, before, after}
}