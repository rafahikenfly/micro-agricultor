import { useAuth } from "../../../services/auth/authContext";
import SVGEntidade from "../../../services/svg/SVGEntidade";
import { createPlantaInputHandler } from "../handlers/MapaPlanta.handlers";
import { MODOS_MAPA } from "../MapaContexto";
import { useMapaEngine } from "../MapaEngine";

export default function MapaPlanta ({planta, showToast}) {
  const { user } = useAuth();
  const engine = useMapaEngine();
  const handlers = createPlantaInputHandler(engine, planta, user, engine.state, showToast)

  const style = {}
    if (engine.state.activeAction === MODOS_MAPA.EDIT) {
      const selecionado = engine.state.selection?.some(
          (s) =>
            s.tipoEntidadeId === "planta" &&
            s.entidadeId === planta.id
        );

      style.opacity = selecionado ? 1 : 0.35;
    }
    if (engine.state.activeAction === MODOS_MAPA.VIEW
     && engine.state.activeTool === "inspect"
     && engine.state.actionConfig?.inspect) {
      const caracteristicaId = engine.state.actionConfig.caracteristicaId;
      style.fill = calcularCorHeatmap(
        canteiro.estadoAtual?.[caracteristicaId]?.valor,
        engine.state.actionConfig.min,
        engine.state.actionConfig.max,
      );
      style.border = "#808080";
    }

  return (
    <SVGEntidade 
      entidade={planta}
      style={style}
      eventos={{
        onClick: (evt) => handlers.onClick(evt),
      }}
    />
  )
}