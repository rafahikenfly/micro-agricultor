import { ENTIDADE } from "micro-agricultor";
import { useMapaEngine } from "../MapaEngine";
import { getMouseInMapSpace, pointNearBorder } from "../../../utils/coordinatesUtils";

import SVGEntidade from "../../../services/svg/SVGEntidade";

export default function ({planta, svgRef, gRef, drag, dragStart, dragMove, centerOn, focusOn}) {
  // Não renderiza se tem propriedade de invisibilidade
  if (!planta.visivelNoMapa) return null
  // Não renderiza se é a entidade sendo movida
  if (drag.isDragging
    && drag.type === "mover"
    && drag.entidade?.id === planta.id) return null;

  const { selection, activeTool, setMapDrag, setShowModal } = useMapaEngine();
  const key = `${ENTIDADE.planta.id}:${planta.id}`;
  const selecionado = selection.isSelected(key);
  const primaria = selection.isPrimary(key);

  const style = {
    opacity: 0.35,
  }
  if (selecionado) style.opacity = 1.00
  if (primaria) style.filter = "drop-shadow(0 0 6px rgba(226, 121, 9, 0.8))";

  const handleStartDrag = (evt) => {
    if (activeTool === "mover") {
      const mapPoint = getMouseInMapSpace(svgRef.current, gRef.current, evt.clientX, evt.clientY)
      const direction = pointNearBorder(mapPoint, planta, planta.aparencia.espessura/2);
      if (direction) {
        setMapDrag({
          active: true,
          geometry: planta.aparencia.geometria,
          preview: {
            fill: planta.aparencia.fundo,
            stroke: planta.aparencia.borda,
            strokeWidth: planta.aparencia.espessura,
            strokeDasharray: "6 4",
            pointerEvents: "none",
          },
        });
        dragStart(evt, {type: "redimensionar", direction, entidade: planta, tipoEntidadeId: ENTIDADE.planta.id})
      } else {
        setMapDrag({
          active: true,
          geometry: planta.aparencia.geometria,
          preview: {
            fill: planta.aparencia.fundo,
            stroke: planta.aparencia.borda,
            strokeWidth: planta.aparencia.espessura,
            pointerEvents: "none",
          },
        });
        dragStart(evt, {type: "mover", entidade: planta, tipoEntidadeId: ENTIDADE.planta.id})
      }
    }
  }
  const handleMouseMove = (evt) => {
    if (drag.isDragging) {
      dragMove(evt);
      return;
    }
    const mapPoint = getMouseInMapSpace(svgRef.current, gRef.current, evt.clientX, evt.clientY)
    const direction = pointNearBorder(mapPoint, planta, planta.aparencia.espessura);
    function getCursor(direction) {
      switch (direction) {
        case "n":
        case "s":
          return "ns-resize";
        case "e":
        case "w":
          return "ew-resize";
        case "ne":
        case "sw":
          return "nesw-resize";
        case "nw":
        case "se":
          return "nwse-resize";
        default:
          return "default";
      }
    }
    evt.target.style.cursor = getCursor(direction);
  }
  return (
    <SVGEntidade 
      entidade={planta}
      style={style}
      eventos={{onClick: (evt) => {
          evt.stopPropagation();
          // Prioridade de pointerTool
          if (activeTool === "fotografar") {
            setShowModal({
              tipoEntidadeId: "fotografar",
            })
          }
          // Navegação
          if (evt.altKey) {
            centerOn(planta.posicao);
            return;
          }
          // Seleção
          if (evt.shiftKey) {
            selection.toggle(key);
          } else {
            selection.selectSingle(key);
          }
        },
        onMouseDown: (evt) => handleStartDrag(evt),
        onMouseMove: (evt) => handleMouseMove(evt),
        onDoubleClick: (evt) => { 
          evt.stopPropagation();
          // Navegação
          if (evt.altKey) {
            focusOn(planta);
            return;
          }
          // Edição
          setShowModal({
          tipo: ENTIDADE.planta.id,
          data: planta
        });}
      }}
    />
  )
}