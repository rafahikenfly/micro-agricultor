import { montarLogEvento } from "@domain/evento.rules";
import { plantarVariedade } from "@domain/planta.rules";
import { db } from "../../../firebase";
import { eventosService } from "../../../services/crud/eventosService";
import { plantasService } from "../../../services/crud/plantasService";
import { toggleSelecao } from "../../../utils/uiUtils";
import { MODOS_MAPA } from "../MapaContexto";

export function createPlantaInputHandler(engine, planta, user, state, showToast) {
  return {
    async onClick(evt) {
      evt.preventDefault();
      if (state.activeAction === MODOS_MAPA.EDIT) {
        // modo edit, gerencia a seleção
        let novaSelecao;

        // multi seleção com CTRL
        if (evt.ctrlKey || evt.metaKey) {
          novaSelecao = toggleSelecao(state.selection, planta, "planta");
        // seleção única sem CTRL
        } else {
          novaSelecao = [{
            entidadeId: planta.id,
            tipoEntidadeId: "planta"
          }];
        }
        engine.setSelecao(novaSelecao);
        return;
      }
      else {
        console.log(`Clicou na planta ${planta.nome} (${planta.id})`)
      }
    }
  }
}