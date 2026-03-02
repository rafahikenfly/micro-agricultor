import { ACTION_TYPES } from "../../../../shared/types/ACTION_TYPES";
import { toggleSelecao } from "../../../utils/uiUtils";
import { MODOS_MAPA } from "../MapaContexto";

export function createPlantaInputHandler(engine, planta, user, showToast, svgRef, gRef) {
  return {
    async onClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      // modo edit, gerencia a seleção
      if (engine.isSelecting) {
        engine.selectSet("planta",
          (evt.ctrlKey || evt.metaKey) ? 
            toggleSelecao(engine.selectionPlantas, planta.id) : // multi seleção (com CTRL)
            [ planta.id ]                                       // seleção única (sem CTRL)
        );
        return;
      }
    },
    onDoubleClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      // Abre modal de edição da entidade
      engine.setPendingMutation({actionType: ACTION_TYPES.EDIT, before: planta})
      engine.selectModalData(planta);
      engine.openModalPlanta();
    },
  }
}