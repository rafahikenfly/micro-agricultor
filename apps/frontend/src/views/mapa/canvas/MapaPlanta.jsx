import { ENTITY_TYPES } from "micro-agricultor";
import { useAuth } from "../../../services/auth/authContext";
import { useMapaEngine } from "../MapaEngine";
import { getMouseInMapSpace, pointNearBorder } from "../../../utils/coordinatesUtils";

import SVGEntidade from "../../../services/svg/SVGEntidade";

export default function ({planta, svgRef, gRef, drag, dragStart, dragMove, centerOn, focusOn}) {

  const { user } = useAuth();
  const engine = useMapaEngine();
  const { selection, activeTool, setMapDrag, setShowModal, setToolState } = useMapaEngine();
  const key = `${ENTITY_TYPES.PLANTA}:${planta.id}`;
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
        dragStart(evt, {type: "redimensionar", direction, entity: planta})
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
        dragStart(evt, {type: "mover", entity: planta})
      }
    }
  }

  // Não renderiza se é a entidade sendo movida
  if (drag.isDragging
    && drag.type === "mover"
    && drag.entity?.id === planta.id) return null;
  return (
    <SVGEntidade 
      entidade={planta}
      style={style}
      eventos={{onClick: (evt) => {
          evt.stopPropagation();
          // Prioridade de pointerTool
          if (activeTool === "fotografar") {
            setToolState({
              timestamp: Date.now(),
              entidadeId: planta.id,
              entidadeNome: planta.nome});
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
        onMouseMove: (evt) => {if (drag.isDragging) dragMove(evt)},
        onDoubleClick: (evt) => { 
          evt.stopPropagation();
          // Navegação
          if (evt.altKey) {
            focusOn(planta);
            return;
          }
          // Edição
          setShowModal({
          tipoEntidadeId: ENTITY_TYPES.PLANTA,
          data: planta
        });}
      }}
    />
  )
}