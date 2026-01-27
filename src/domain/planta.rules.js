// domain/planta/planta.rules.js

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
  
  export function manejarPlanta(planta, manejo) {
    // estado
    const canteiroManejado = {
        ...planta,
        caracteristicas: {
            ...(planta.caracteristicas ?? {}),
        },
    };

    // Estado
    if (manejo.estadoDestinoId) {
        canteiroManejado.estadoId = manejo.estadoDestinoId
    }
    if (manejo.estadoDestinoNome) {
        canteiroManejado.estadoNome = manejo.estadoDestinoNome
    }

    //
    if (Array.isArray(manejo.efeitos)) {
        manejo.efeitos.forEach((ef) => {
            const valorAtual = canteiroManejado.caracteristicas[ef.caracteristicaId] ?? 0;
            switch (ef.tipoEfeitoId) {
                case "delta":
                    canteiroManejado.caracteristicas[ef.caracteristicaId] = valorAtual + Number(ef.valorEfeito)
                    break;
                case "multiplicador":
                    canteiroManejado.caracteristicas[ef.caracteristicaId] = valorAtual * Number(ef.valorEfeito)
                    break;
                case "fixo":
                    canteiroManejado.caracteristicas[ef.caracteristicaId] = Number(ef.valorEfeito)
                    break;
                default: throw new Error(`Tipo de efeito ${ef.tipoEfeitoNome} (${ef.tipoEfeitoId}) inválido`);
            }
        });
    }
    return canteiroManejado
}
