const estadoInicial = {
  id: "HLRvq5eExZAiKSZOcnaF",
  nome: "Prevista",
}

import { timestamp } from "../firebase";

export function mudarVariedade(planta, novaVariedade) {
    return {
      ...planta,
  
      // identidade botânica
      especieId: novaVariedade.especieId,
      especieNome: novaVariedade.especieNome,
      variedadeId: novaVariedade.id,
      variedadeNome: novaVariedade.nome,
  
      // aparência
      aparencia: {
        borda: novaVariedade.aparencia.borda,
        espessura: novaVariedade.aparencia.espessura,
        fundo: novaVariedade.aparencia.fundo,
        elipse: novaVariedade.aparencia.elipse,
        vertices: novaVariedade.aparencia.vertices,
      },
  
    };
  }
  
export function manejarPlanta(planta, manejo, eventoId) {
  const ts = timestamp();
  // Cria uma cópia da planta para não modificar o original, garantindo a existencia da chave estadoAtual
  const plantaManejada = {
    ...planta,
    estadoAtual: {
      ...(planta.estadoAtual ?? {}),
    },
  };
  const relatorioEfeitos = {};

  // Atualiza o estado de destino da planta conforme o manejo
  if (manejo.estadoDestinoId) {
    plantaManejada.estadoId = manejo.estadoDestinoId;
    plantaManejada.estadoNome = manejo.estadoDestinoNome;
  }

  // Processa os efeitos do manejo
  if (Array.isArray(manejo.efeitos)) {
    manejo.efeitos.forEach((ef) => {
      // Garante que a característica exista no estadoAtual
      const atual =
        plantaManejada.estadoAtual[ef.caracteristicaId] ?? {
          valor: 0,
          confianca: 0,
          eventos: [],
          manejos: [],
        };

      // Salva os valores antes do efeito
      const valorAntes = atual.valor ?? 0;
      const confiancaAntes = atual.confianca ?? 0;

      let valorDepois = valorAntes;
      let confiancaDepois = confiancaAntes;

      // Aplica o efeito conforme o tipo
      switch (ef.tipoEfeitoId) {
        case "delta": valorDepois += Number(ef.valorEfeito);
          break;
        case "multiplicador":  valorDepois *= Number(ef.valorEfeito);
          break;
        case "fixo": valorDepois = Number(ef.valorEfeito);
          break;
        default:
          throw new Error( `Tipo de efeito ${ef.tipoEfeitoId} inválido` );
      }
      // Aplica efeito na confiança
      if (ef.valorConfianca !== undefined) {
        confiancaDepois = Number(ef.valorConfianca);
      }

      // Atualiza estadoAtual com merge
      plantaManejada.estadoAtual[ef.caracteristicaId] = {
        ...atual,
        valor: valorDepois,
        confianca: confiancaDepois,
        calculadoEm: ts,
        manejos: [...(atual.manejos ?? []), eventoId],
      };

      // Registra efeito líquido no relatório
      relatorioEfeitos[ef.caracteristicaId] = {
        valorAntes: // Preserva valores anteriores se já houver efeito registrado
          relatorioEfeitos[ef.caracteristicaId]?.valorAntes ??
          valorAntes,
        valorDepois,
        deltaValor: // Calcula o delta
          valorDepois -
          (relatorioEfeitos[ef.caracteristicaId]?.valorAntes ??
            valorAntes),

        confiancaAntes: // Preserva valores anteriores se já houver efeito registrado
          relatorioEfeitos[ef.caracteristicaId]?.confiancaAntes ??
          confiancaAntes,
        confiancaDepois,
        deltaConfianca: // Calcula o delta
          confiancaDepois -
          (relatorioEfeitos[ef.caracteristicaId]?.confiancaAntes ??
            confiancaAntes),
        tiposEfeito: [ // Acumula os tipos de efeito aplicados
          ...(relatorioEfeitos[ef.caracteristicaId]
            ?.tiposEfeito ?? []),
          ef.tipoEfeitoId,
        ],
      };
    });
  }

  return {
    plantaManejada,
    relatorioEfeitos,
  };
}

export function monitorarPlanta(planta, medidas, logMonitoramentoId) {
  const ts = timestamp();
  // Cria uma cópia da planta para não modificar o original, garantindo a existencia da chave estadoAtual
  const plantaMonitorada = {
    ...planta,
    estadoAtual: {
      ...(planta.estadoAtual ?? {})
    },
  };
  const relatorioEfeitos = {};

  // Processa as medidas da medicao
  Object.entries(medidas).forEach(([caracteristicaId, medida]) => {
    // Garante que a característica exista no estadoAtual
    const atual =
      plantaMonitorada.estadoAtual[caracteristicaId] ?? {};

    // Salva os valores antes da medida
    const valorAntes = atual.valor ?? 0;
    const confiancaAntes = atual.confianca ?? 0;
    
    // Registra efeito líquido no relatório
    relatorioEfeitos[caracteristicaId] = {
      valorAntes,
      valorDepois: medida.valor,
      deltaValor: medida.valor - valorAntes,
      confiancaAntes,
      confiancaDepois: medida.confianca,
      deltaConfianca: medida.confianca - confiancaAntes,
    };

    // Reinicializa a característica com a medida, limpando eventos e manejos anteriores
    plantaMonitorada.estadoAtual[caracteristicaId] = {
      ...atual,
      valor: medida.valor,          // Reinicializa o valor
      confianca: medida.confianca,  // Reinicializa a confiança
      calculadoEm: ts,
      ultimaMedicao: {              // O valor da medição é armazenado em ultimaMedicao
        id: logMonitoramentoId,
        valor: medida.valor,
        confianca: medida.confianca,
        timestamp: ts,
      },
      eventos: [], // Limpa eventos anteriores após medição
      manejos: [], // Limpa manejos anteriores após medição
    };
  });
  return {
    plantaMonitorada,
    relatorioEfeitos
  };
}

export function plantarVariedade({especie, variedade, tecnica, canteiro, posicao}) {
  if (!especie) throw new Error ("Erro plantando variedade: especie obrigatório.")
  if (!variedade) throw new Error ("Erro plantando variedade: variedade obrigatório.")
  if (!tecnica) throw new Error ("Erro plantando variedade: tecnica obrigatório.")
  if (!canteiro) throw new Error ("Erro plantando variedade: canteiro obrigatório.")
  if (!posicao) throw new Error ("Erro plantando variedade: posicao obrigatória.")
  if (!variedade?.ciclo?.find(est => est.estagioId === tecnica.estagioId)?.dimensao)
    throw new Error (`Variedade ${variedade.nome} não possui dimensão no estágio ${tecnica.estagioNome}.`)

  
  const novaPlanta = {
    aparencia: variedade.aparencia,
    canteiroId: canteiro.id,
    canteiroNome: canteiro.nome,
    dimensao: variedade?.ciclo?.find(est => est.estagioId === tecnica.estagioId)?.dimensao,// ?? {x:1,y:1,z:0},
    especieId: especie.id,
    especieNome: especie.nome,
    estadoId: estadoInicial.id,
    estadoNome: estadoInicial.nome,
    estagioId: tecnica.estagioId,
    estagioNome: tecnica.estagioNome,
    hortaId: canteiro.hortaId,
    hortaNome: canteiro.hortaNome,
    nome: "Nova planta",
    posicao: {
      x: Math.round(posicao.x) || 0,
      y: Math.round(posicao.y) || 0,
      z: Math.round(posicao.z) || 0,
    },
    variedadeId: variedade.id,
    variedadeNome: variedade.nome,
  }
  return novaPlanta
}