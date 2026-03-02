export const TIPOS_EVENTO = {
  MONITORAMENTO: { id: "monitoramento",
    nome: "Monitoramento",
    acaoIdCampo: "caracteristica",
  },
  INSPECAO: { id: "inspecao", nome: "Inspeção", acaoIdCampo: "caracteristica", aplicavel: {planta: true, canteiro: true}},
  MANEJO: { id: "manejo",
    nome: "Manejo",
    acaoIdCampo: "caracteristica",
  },
  PLANTIO: { id: "plantio", nome: "Plantio", acaoIdCampo: "estagioId",},
  DEGRADACAO: { id: "degradação", nome: "Degradação", acaoIdCampo: "estagioId",},
};
