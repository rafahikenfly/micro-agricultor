import { montarLogEvento } from "@domain/evento.rules";
import { plantarVariedade } from "@domain/planta.rules";
import { db } from "../../../firebase";
import { eventosService } from "../../../services/crud/eventosService";
import { plantasService } from "../../../services/crud/plantasService";
import { toggleSelecao } from "../../../utils/uiUtils";
import { MODOS_MAPA } from "../MapaContexto";

export function createCanteiroInputHandler(engine, canteiro, user, state, showToast) {
  return {
    async onClick(evt) {
      evt.preventDefault();
      if (state.activeAction === MODOS_MAPA.EDIT) {
        // modo edit, gerencia a seleção
        let novaSelecao;

        // multi seleção com CTRL
        if (evt.ctrlKey || evt.metaKey) {
          novaSelecao = toggleSelecao(state.selection, canteiro, "canteiro");
        // seleção única sem CTRL
        } else {
          novaSelecao = [{
            entidadeId: canteiro.id,
            tipoEntidadeId: "canteiro"
          }];
        }
        engine.setSelecao(novaSelecao);
        return;
      }

      // modo plantar e com configuração, realiza o evento plantio
      if (state.activeAction === MODOS_MAPA.PLANT && state.actionConfig) {
        const pontos = state.actionConfig.preview.pontos;
        if (!pontos || pontos.length === 0) {
          console.warn("Preview sem pontos");
          return;
        }
        const { actionConfig, } = state;

        let novaPlantaCount = 0;
        const batch = db.batch();
        try {
          const alvos = [];
          
          // ===== cria plantas =====
          for (const ponto of pontos) {
          novaPlantaCount++;

          const novaPlanta = plantarVariedade({
              especie: actionConfig.especie,
              variedade: actionConfig.variedade,
              tecnica: actionConfig.tecnica,
              canteiro,
              posicao: ponto,
          });
          novaPlanta.nome = `Nova planta ${novaPlantaCount}`;

          const novaPlantaRef = plantasService.batchCreate(
              novaPlanta,
              user,
              batch
          );

          alvos.push(novaPlantaRef.id);
          }

          if (alvos.length === 0) return;

          // ===== cria evento =====
          const evento = montarLogEvento({
          tipoEventoId: "plantio",
          alvos,
          origemId: user.id,
          origemTipo: "usuario",
          data: {
              tipoEntidadeId: "planta",
              tecnicaId: actionConfig.tecnica?.estagioId,
          },
          });
          eventosService.batchCreate(evento, user, batch);
          await batch.commit();
          showToast(`Plantio de ${novaPlantaCount} planta${novaPlantaCount > 1 ? "s" : ""} registrado com sucesso.`);
          engine.resetAction();

        } catch (err) {
            console.error("Erro no plantio:", err);
            showToast(`Erro ao plantar: ${err}`, "danger")
        }
      }
      else {
        console.log(`Clicou no canteiro ${canteiro.nome} (${canteiro.id})`)
      }
    }
  }
}