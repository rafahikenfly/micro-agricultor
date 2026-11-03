import { ENTIDADE } from "micro-agricultor";
import { useMapaEngine } from "../MapaEngine";
import { getMouseInMapSpace, pointNearBorder } from "../../../utils/coordinatesUtils";

import SVGEntidade from "../../../services/svg/SVGEntidade";

export default function ({dispositivo, svgRef, gRef, drag, dragStart, dragMove, centerOn, focusOn, onContextMenu, destaque = false}) {

  // Não renderiza se tem propriedade de invisibilidade
  if (!dispositivo.visivelNoMapa) return null
  // Não renderiza se é a entidade sendo movida
  if (drag.isDragging
    && drag.type === "mover"
    && drag.entidade?.id === dispositivo.id) return null;

  const { selection, activeTool, setMapDrag, setShowModal } = useMapaEngine();
  const key = `${ENTIDADE.dispositivo.id}:${dispositivo.id}`;
  const selecionado = selection.isSelected(key);
  const primaria = selection.isPrimary(key);

  const style = {
    opacity: 0.35,
  }
  if (selecionado) style.opacity = 1.00
  if (primaria) style.filter = "drop-shadow(0 0 6px rgba(226, 121, 9, 0.8))";

  if (destaque) {
    style.stroke = "#22c55e";
    style.strokeWidth = Math.max(dispositivo.aparencia?.espessura ?? 1, 4);
    style.filter = "drop-shadow(0 0 6px rgba(34, 197, 94, 0.9))";
  }

  const handleStartDrag = (evt) => {
    if (activeTool === "mover") {
      const mapPoint = getMouseInMapSpace(svgRef.current, gRef.current, evt.clientX, evt.clientY)
      const direction = pointNearBorder(mapPoint, dispositivo, dispositivo.aparencia.espessura/2);
      if (direction) {
        setMapDrag({
          active: true,
          geometry: dispositivo.aparencia.geometria,
          preview: {
            fill: dispositivo.aparencia.fundo,
            stroke: dispositivo.aparencia.borda,
            strokeWidth: dispositivo.aparencia.espessura,
            strokeDasharray: "6 4",
            pointerEvents: "none",
          },
        });
        dragStart(evt, {type: "redimensionar", direction, entidade: dispositivo, tipoEntidadeId: ENTIDADE.dispositivo.id})
      } else {
        setMapDrag({
          active: true,
          geometry: dispositivo.aparencia.geometria,
          preview: {
            fill: dispositivo.aparencia.fundo,
            stroke: dispositivo.aparencia.borda,
            strokeWidth: dispositivo.aparencia.espessura,
            pointerEvents: "none",
          },
        });
        dragStart(evt, {type: "mover", entidade: dispositivo, tipoEntidadeId: ENTIDADE.dispositivo.id})
      }
    }
  }
  const handleMouseMove = (evt) => {
    if (drag.isDragging) {
      dragMove(evt);
      return;
    }
    const mapPoint = getMouseInMapSpace(svgRef.current, gRef.current, evt.clientX, evt.clientY)
    const direction = pointNearBorder(mapPoint, dispositivo, dispositivo.aparencia.espessura);
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
      entidade={dispositivo}
      style={style}
      eventos={{onClick: (evt) => {
          evt.stopPropagation();
          // Prioridade de pointerTool, p. ex
          //if (activeTool === "fotografar") {
          //  setShowModal({
          //    tipoEntidadeId: "fotografar",
          //  })
          //}
          // Navegação
          if (evt.altKey) {
            centerOn(dispositivo.posicao);
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
          focusOn(dispositivo);
        },
        onContextMenu: (evt) => {
          evt.preventDefault(); // evita o menu padrão do navegador
          evt.stopPropagation();
          onContextMenu?.(evt, ENTIDADE.dispositivo.id, dispositivo);
        }        
      }}
    />
  )
}