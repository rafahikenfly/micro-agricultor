import { useAuth } from "../../../services/auth/authContext";
import SVGEntidade from "../../../services/svg/SVGEntidade";
import { calcularCorHeatmap } from "../../../utils/uiUtils";
import { createCanteiroInputHandler, } from "../handlers/MapaCanteiro.handlers";
import { MODOS_MAPA } from "../MapaContexto";
import { useMapaEngine } from "../MapaEngine";

export default function MapaCanteiro ({canteiro, showToast}) {
  const { user } = useAuth();
  const engine = useMapaEngine();
  const handlers = createCanteiroInputHandler(engine, canteiro, user, engine.state, showToast)

  const style = {}
    if (engine.state.activeAction === MODOS_MAPA.EDIT) {
      const selecionado = engine.state.selection?.some(
          (s) =>
            s.tipoEntidadeId === "canteiro" &&
            s.entidadeId === canteiro.id
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
      entidade={canteiro}
      style={style}
      eventos={{
        onClick: (evt) => handlers.onClick(evt),
      }}
    />
  )
}