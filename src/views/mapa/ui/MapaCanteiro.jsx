import { useAuth } from "../../../services/auth/authContext";
import { getResizeBox as getResizeRect, getResizeCircle } from "../../../services/svg/PointFunctions";
import SVGEntidade from "../../../services/svg/SVGEntidade";
import { calcularCorHeatmap } from "../../../utils/uiUtils";
import { createCanteiroInputHandler, } from "../handlers/MapaCanteiro.handlers";
import { useMapaEngine } from "../MapaEngine";

export default function MapaCanteiro ({canteiro, showToast, svgRef, gRef}) {
  const { user } = useAuth();
  const engine = useMapaEngine();
  const handlers = createCanteiroInputHandler(engine, canteiro, user, showToast, svgRef, gRef)

  let box = {}
  const style = {}
  if (engine.isSelecting) {
    const selecionado = engine.selectionCanteiros.includes(canteiro.id);
    style.opacity = selecionado ? 1 : 0.35;
    if (selecionado && engine.isHeatmapActive("canteiro")) {
      const { caracteristicaId, min, max } = engine.state.heatmap;
      const valor = canteiro.estadoAtual?.[caracteristicaId]?.valor;
      style.fill = calcularCorHeatmap(valor, min, max,) 
      style.stroke = style.fill
    }
  }
  if (engine.isResizing(canteiro.id)) {
    if (canteiro.aparencia.geometria === "rect")   box = getResizeRect(canteiro, engine.state.resize)
    if (canteiro.aparencia.geometria === "circle") box = getResizeCircle(canteiro, engine.state.resize)
    // TODO: ajustar resize do circle
    // TODO: ellipse
    // TODO: polygon
    style.strokeDasharray = "6 4";
  }

  return (
    <SVGEntidade
      entidade={canteiro}
      box={box}
      style={style}
      eventos={{
        onClick: (evt) => handlers.onClick(evt),
        onDoubleClick: (evt) => handlers.onDoubleClick(evt),
        onMouseDown: (evt) => handlers.onMouseDown(evt, canteiro),
        onMouseMove: (evt) => handlers.onMouseMove(evt),
        onMouseUp: (evt) => handlers.onMouseUp(evt),
//        onMouseEnter: (evt) => handlers.onMouseEnter(evt),
//        onMouseLeave: (evt) => handlers.onMouseLeave(evt),
      }}
    />
  )
}