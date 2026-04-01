import { ENTIDADE, derivar, } from "micro-agricultor";
import { useMapaEngine } from "../MapaEngine";
import { getMouseInMapSpace, getPreviewPoints, pointNearBorder } from "../../../utils/coordinatesUtils";

import SVGEntidade from "../../../services/svg/SVGEntidade";
import { plantasService } from "../../../services/crud/plantasService";
import { useAuth } from "../../../services/auth/authContext";
import { batchService } from "../../../services/batchService";
import { eventosService, mutacoesService } from "../../../services/historyService";

export default function MapaCanteiro ({canteiro, svgRef, gRef, drag, dragStart, dragMove, centerOn, focusOn}) {
  const { user } = useAuth();
  const { selection, activeTool, toolSetup, previewSetup, setMapDrag, setShowModal, setMapPreviewActive } = useMapaEngine();
  const key = `${ENTIDADE.canteiro.id}:${canteiro.id}`;
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
        dragStart(evt, {type: "redimensionar", direction, entidade: canteiro, tipoEntidadeId: ENTIDADE.canteiro.id})
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
        dragStart(evt, {type: "mover", entidade: canteiro, tipoEntidadeId: ENTIDADE.canteiro.id})
      }
    }
  }
  const handleMouseMove = (evt) => {
    if (drag.isDragging) {
      dragMove(evt);
      return;
    }
    const mapPoint = getMouseInMapSpace(svgRef.current, gRef.current, evt.clientX, evt.clientY)
    const direction = pointNearBorder(mapPoint, canteiro, canteiro.aparencia.espessura);
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

  // Não renderiza se drag ativo, do tipo mover e é esta a entidade sendo movida
  if (drag.isDragging
    && drag.type === "mover"
    && drag.entidade?.id === canteiro.id) return null;
  return (
    <SVGEntidade
      entidade={canteiro}
      style={style}
      eventos={{onClick: (evt) => {
          evt.stopPropagation();
          // Prioridade de pointerTool
          if (activeTool === "plantar") {
            const cursorMap = getMouseInMapSpace(svgRef.current, gRef.current, evt.clientX, evt.clientY)
            const posicoes = getPreviewPoints({
              start: cursorMap,
              geometria: previewSetup.entidade.aparencia.geometria,
              layout: previewSetup.layout,
            });
            derivar({
              tipoEntidadeId: ENTIDADE.planta.id,
              posicoes,
              canteiro,
              ...toolSetup.plantar.metadata,
              services: {
                batch: batchService,
                eventos: eventosService,
                entidade: plantasService,
                mutacoes: mutacoesService,
              },
              user,
              timestamp: Date.now()
            })
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
        onMouseMove: (evt) => handleMouseMove(evt),
        onDoubleClick: (evt) => { 
          evt.stopPropagation();
          // Navegação
          if (evt.altKey) {
            focusOn(canteiro);
            return;
          }
          // Edição
          setShowModal({
          tipo: ENTIDADE.canteiro.id,
          data: canteiro
        });}
      }}
     />
  )
}