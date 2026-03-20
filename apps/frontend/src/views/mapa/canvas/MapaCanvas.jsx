import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { NoUser } from "../../../components/common/NoUser";
import { hortaService } from "../../../services/crud/hortaService";
import { canteirosService } from "../../../services/crud/canteirosService";
import { plantasService } from "../../../services/crud/plantasService";

import { useAuth } from "../../../services/auth/authContext";
import { useSVGTransform } from "../../../hooks/useSVGTransform";
import { useTransformGestures } from "../../../hooks/useTransformGestures";

import MapaBussola from "./MapaBussola"
import MapaHorta from "./MapaHorta"
import MapaCanteiro from "./MapaCanteiro"
import MapaPlanta from "./MapaPlanta"
import Loading from "../../../components/Loading"
import { useMapaEngine } from "../MapaEngine";
import { useDrag } from "../../../hooks/useDrag";
import MapaDrag from "./MapaDrag";
import { entitiesInBounds, getMouseInMapSpace } from "../../../utils/coordinatesUtils";
import { ENTITY_TYPES } from "micro-agricultor";
import MapaPreview from "./MapaPreview";

export default function MapaCanvas () {
  // Recupera usuário
  const { user } = useAuth();
  if (!user) return <NoUser />;

  // Recupera horta
  const { hortaId } = useParams();
  if (!hortaId) return <div>Selecione uma horta.</div>

  //Conecta hooks
  const svgRef = useRef(null);
  const { activeTool, dragActive, selection, previewActive} = useMapaEngine();
  const { drag, dragStart, dragMove, dragFinish } = useDrag();
  const { gRef, pan, zoomAt, rotateAt, centerOn, focusOn } = useSVGTransform({
    onRotate: (newRotate) => setRotateState(newRotate),
//    onZoom: (newScale) => setZoomState(newScale),
  });
  useTransformGestures(svgRef, { active: activeTool === null, pan, zoom: zoomAt, rotate: rotateAt });

  //States
  const [rotateState, setRotateState] = useState(0);
  //const [zoomState, setZoomState] = useState(0);
  const [horta, setHorta] = useState(null);
  const [canteiros, setCanteiros] = useState([]);
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState([]);

  //Carrega dados
  useEffect(() => {

    if (!hortaId) return;

    setCanteiros([]);
    setPlantas([]);
    setHorta(null);
    setLoading(true);
    let loaded = 0;
    const total = 3;

    const markLoaded = () => {
      loaded++;
      if (loaded === total) setLoading(false);
    };

    const unsubCanteiros = canteirosService.subscribe((data) => {
      setCanteiros(data);
      markLoaded();
    }, [{field: "hortaId", op: "==", value: hortaId}]);

    const unsubPlantas = plantasService.subscribe((data) => {
      setPlantas(data);
      markLoaded();
    }, [{field: "hortaId", op: "==", value: hortaId}]);


    async function carregarHorta() {
      if (!hortaId) return;

      const data = await hortaService.getDataById(hortaId);

      setHorta(data);
      markLoaded();
    }

    carregarHorta();

    return () => {
      unsubCanteiros();
      unsubPlantas();
    };
  }, [hortaId]);

  if (loading) return <Loading variant="overlay" />
  if (!horta) return <div>Nada por aqui...</div>

  const handleFinishDrag = (evt) => {
    dragFinish(evt,svgRef);

    const startMap = getMouseInMapSpace(svgRef.current, gRef.current, drag.start.x, drag.start.y);
    const currentMap = getMouseInMapSpace(svgRef.current, gRef.current, drag.current.x, drag.current.y);
    //TODO: Clamp no grid

    if (activeTool !== "selecionar") {
      console.log(drag.type,startMap, "para", currentMap)
    }
    else {
      // Calcula os limites
      const bounds = {
        minX: Math.min(startMap.x, currentMap.x),
        maxX: Math.max(startMap.x, currentMap.x),
        minY: Math.min(startMap.y, currentMap.y),
        maxY: Math.max(startMap.y, currentMap.y),
      };

      // Filtra a nova seleção
      const canteirosSelecionados = entitiesInBounds(canteiros, bounds)
      const plantasSelecionadas = entitiesInBounds(plantas, bounds)

      // Limpa e rafaz seleção
      selection.clear();
      canteirosSelecionados.forEach(canteiro => {
        const key = `${ENTITY_TYPES.CANTEIRO}:${canteiro.id}`;
        selection.add(key);
      });

      plantasSelecionadas.forEach(planta => {
        const key = `${ENTITY_TYPES.PLANTA}:${planta.id}`;
        selection.add(key);
      });
    }
  }

  const handleStartDrag = (evt) => {
    switch (activeTool) {
      case "selecionar":
        dragStart(evt, { type: "selecionar" })
        break;
      case "desenhar":
        dragStart(evt, { type: "desenhar" })
        break;
      default:
        console.warn("Tool sem drag start handler:", activeTool);
    }
  }

  return (
      <div
        style={{
          width: "90vw",
          height: "90vh",
          overflow: "hidden",
          border: "solid black 1px",
          position: "relative",
        }}
      >

        <svg ref={svgRef} width="100%" height="100%"
          onMouseDown={(evt)=>{if (dragActive) handleStartDrag(evt)}}
          onMouseMove={(evt)=>{if (dragActive) dragMove(evt)}}
          onMouseUp={(evt)=>{if (dragActive) handleFinishDrag(evt)}}        
        >
          <g ref={gRef} >
            <MapaHorta
              horta={horta}
              svgRef={svgRef.current}
              gRef={gRef.current}
            />
            {canteiros.map((cant) => (
              <MapaCanteiro
                key={cant.id}
                canteiro={cant}
                svgRef={svgRef}
                gRef={gRef}
                drag={drag}
                dragStart={dragStart}
                dragMove={dragMove}
                centerOn={centerOn}
                focusOn={focusOn}
              />
            ))}
            {plantas.map((plan) => (
              <MapaPlanta
                key={plan.id}
                planta={plan}
                svgRef={svgRef}
                gRef={gRef}
                drag={drag}
                dragStart={dragStart}
                dragMove={dragMove}
                centerOn={centerOn}
                focusOn={focusOn}
              />
            ))}
            {drag.isDragging && <MapaDrag svgRef={svgRef} gRef={gRef} drag={drag}/>}
            {previewActive && <MapaPreview svgRef={svgRef} gRef={gRef} />}
          </g>
        </svg>
        <MapaBussola
          orientacao={horta?.posicao?.orientacao}
          rotacao={rotateState}
        />
      </div>
  )
}