import { ENTITY_TYPES } from "micro-agricultor";
import { useAuth } from "../../../services/auth/authContext";
import { useMapaEngine } from "../MapaEngine";
import { getMouseInMapSpace, pointNearBorder } from "../../../utils/coordinatesUtils";

import SVGEntidade from "../../../services/svg/SVGEntidade";

import { calcularCorHeatmap } from "../../../utils/uiUtils";

export default function MapaCanteiro ({canteiro, svgRef, gRef, drag, dragStart, dragMove, centerOn, focusOn}) {
  const { user } = useAuth();
  const { selection, activeTool, setMapDrag, setShowModal, setMapPreviewActive } = useMapaEngine();
  const key = `${ENTITY_TYPES.CANTEIRO}:${canteiro.id}`;
  const selecionado = selection.isSelected(key);
  const primaria = selection.isPrimary(key);

  const style = {
    opacity: 0.35,
  }
  if (selecionado) style.opacity = 1
  if (primaria) style.filter = "drop-shadow(0 0 6px rgba(13,110,253,0.8))";

  const handleStartDrag = (evt) => {
    if (activeTool === "mover") {
      const mapPoint = getMouseInMapSpace(svgRef.current, gRef.current, evt.clientX, evt.clientY)
      const direction = pointNearBorder(mapPoint, canteiro, canteiro.aparencia.espessura);
      if (direction) {
        setMapDrag({
          active: true,
          geometry: canteiro.aparencia.geometria,
          preview: {
            fill: canteiro.aparencia.fundo,
            stroke: canteiro.aparencia.borda,
            strokeWidth: canteiro.aparencia.espessura,
            strokeDasharray: "6 4",
            pointerEvents: "none",
          },
        });
        dragStart(evt, {type: "redimensionar", direction, entity: canteiro})
      } else {
        setMapDrag({
          active: true,
          geometry: canteiro.aparencia.geometria,
          preview: {
            fill: canteiro.aparencia.fundo,
            stroke: canteiro.aparencia.borda,
            strokeWidth: canteiro.aparencia.espessura,
            pointerEvents: "none",
          },
        });
        dragStart(evt, {type: "mover", entity: canteiro})
      }
    }
  }

  // Não renderiza se é a entidade sendo movida
  if (drag.isDragging
    && drag.type === "mover"
    && drag.entity?.id === canteiro.id) return null;
  return (
    <SVGEntidade
      entidade={canteiro}
      style={style}
      eventos={{onClick: (evt) => {
          evt.stopPropagation();
          // Prioridade de pointerTool
          if (activeTool === "plantar") {
            const cursorMap = getMouseInMapSpace(svgRef.current, gRef.current, evt.clientX, evt.clientY)
            console.log(`plantou em ${canteiro.nome}`, cursorMap)
            setMapPreviewActive(false)
            return
          }
          // Navegação
          if (evt.altKey) {
            centerOn(canteiro.posicao);
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
        onMouseMove: (evt) => {if (drag.isDragging) dragMove(evt)},
        onDoubleClick: (evt) => { 
          evt.stopPropagation();
          // Navegação
          if (evt.altKey) {
            focusOn(canteiro);
            return;
          }
          // Edição
          setShowModal({
          tipoEntidadeId: ENTITY_TYPES.CANTEIRO,
          data: canteiro
        });}
      }}
     />
  )
}