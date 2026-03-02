import { useAuth } from "../../../services/auth/authContext";
import SVGEntidade from "../../../services/svg/SVGEntidade";
import { createPlantaInputHandler } from "../handlers/MapaPlanta.handlers";
import { calcularCorHeatmap } from "../../../utils/uiUtils";
import { useMapaEngine } from "../MapaEngine";

export default function MapaPlanta ({planta, showToast, svgRef, gRef}) {
  const { user } = useAuth();
  const engine = useMapaEngine();
  const handlers = createPlantaInputHandler(engine, planta, user, showToast, svgRef, gRef)

  const style = {}
  if (engine.isSelecting) {
    const selecionado = engine.selectionPlantas.includes(planta.id);
    style.opacity = selecionado ? 1 : 0.35;
    if (selecionado && engine.isHeatmapActive("planta")) {
      const { caracteristicaId, min, max } = engine.state.heatmap;
      const valor = planta.estadoAtual?.[caracteristicaId]?.valor;
      style.fill = calcularCorHeatmap(valor, min, max,) 
      style.stroke = style.fill
    }
  }

  return (
    <SVGEntidade 
      entidade={planta}
      style={style}
      eventos={{
        onClick: (evt) => handlers.onClick(evt),
        onDoubleClick: (evt) => handlers.onDoubleClick(evt),
      }}
    />
  )
}