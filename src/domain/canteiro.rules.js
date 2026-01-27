export function manejarCanteiro(canteiro, manejo) {
    // estado
    const canteiroManejado = {
        ...canteiro,
        caracteristicas: {
            ...(canteiro.caracteristicas ?? {}),
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
