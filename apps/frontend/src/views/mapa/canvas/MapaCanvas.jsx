import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { criarCanteiro, criarContextoDispositivo, criarDispositivo, criarPlanta, ENTIDADE, GEOMETRIA, movimentar, redimensionar } from "micro-agricultor";

import { useAuth } from "../../../services/auth/authContext";
import { useSVGTransform } from "../../../hooks/useSVGTransform";
import { useTransformGestures } from "../../../hooks/useTransformGestures";
import { useDrag } from "../../../hooks/useDrag";
import { useMapaEngine } from "../MapaEngine";

import { entitiesInBounds, getMouseInMapSpace } from "../../../utils/coordinatesUtils";
import { circleFromEntity, rectFromEntity, resizeCircleRadius, resizeRect } from "../../../utils/geometryUtils";

import { batchService } from "../../../services/batchService";
import { hortasService, canteirosService, plantasService, entidadesService, dispositivosService, tarefasService} from "../../../services/crudService";
import { eventosService, mutacoesService } from "../../../services/historyService";

import { NoUser } from "../../../components/common/NoUser";
import Loading from "../../../components/Loading"

import MapaBussola from "./MapaBussola"
import MapaHorta from "./MapaHorta"
import MapaCanteiro from "./MapaCanteiro"
import MapaPlanta from "./MapaPlanta"
import MapaDrag from "./MapaDrag";
import MapaDispositivo from "./MapaDispositivo";
import MapaPreview from "./MapaPreview";
import { useMemo } from "react";
import MapaContextMenu from "./MapaContextMenu";

const servicesMap = {
  [ENTIDADE.planta.id]: plantasService,
  [ENTIDADE.canteiro.id]: canteirosService,
  [ENTIDADE.dispositivo.id]: dispositivosService,
  tarefa: tarefasService,
}

export default function MapaCanvas () {
  // Recupera usuário
  const { user } = useAuth();
  if (!user) return <NoUser />;

  // Recupera horta
  const { hortaId } = useParams();
  if (!hortaId) return <div>Selecione uma horta.</div>

  //Conecta hooks
  const svgRef = useRef(null);
  const { activeTool, toolSetup, setTool, setToolState, dragActive, selection, previewActive, setShowModal, filters } = useMapaEngine();
  const { drag, dragStart, dragMove, dragFinish } = useDrag();
  const { gRef, pan, zoomAt, rotateAt, centerOn, focusOn } = useSVGTransform({
    onRotate: (newRotate) => setRotateState(newRotate),
//    onZoom: (newScale) => setZoomState(newScale),
  });
  useTransformGestures(svgRef, { active: activeTool === null, pan, zoom: zoomAt, rotate: rotateAt });

  //States
  const [rotateState, setRotateState] = useState(0);
  const [contextMenu, setContextMenu] = useState(null);
  //const [zoomState, setZoomState] = useState(0);
  const [horta, setHorta] = useState(null);
  const [canteiros, setCanteiros] = useState([]);
  const [plantas, setPlantas] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState([]);

  //Carrega dados
  useEffect(() => {

    if (!hortaId) return;

    setCanteiros([]);
    setPlantas([]);
    setDispositivos([]);
    setHorta(null);
    setLoading(true);
    let loaded = 0;
    const total = 4;

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
    }, [
      {field: "hortaId", op: "==", value: hortaId},
      { field: "visivelNoMapa", op: "==", value: true }
    ]);
    const unsubDispositivos = dispositivosService.subscribe((data) => {
      setDispositivos(data);
      markLoaded();
    }, [
      {field: "hortaId", op: "==", value: hortaId},
      { field: "visivelNoMapa", op: "==", value: true }
    ]);

    async function carregarHorta() {
      if (!hortaId) return;

      const data = await hortasService.getDataById(hortaId);

      setHorta(data);
      markLoaded();
    }

    carregarHorta();

    return () => {
      unsubCanteiros();
      unsubPlantas();
      unsubDispositivos();
    };
  }, [hortaId]);

  //Filtra as entidades
  const plantasFiltradas = useMemo(() => {
    let resultado = plantas;
    if (filters?.planta?.estadoId) {
      resultado = resultado.filter(
        (planta) => planta.estadoId === filters.planta.estadoId
      );
    }

    if (filters?.planta?.especieId) {
      resultado = resultado.filter(
        (planta) => planta.especieId === filters.planta.especieId
      );
    }

    if (filters?.planta?.estagioId) {
      resultado = resultado.filter(
        (planta) => planta.estagioId === filters.planta.estagioId
      );
    }

    if (
      activeTool === "operar" &&
      toolSetup.operar?.posicao &&
      toolSetup.operar?.dimensao
    ) {
      const bounds = {
        minX: toolSetup.operar.posicao.x - toolSetup.operar.dimensao.x / 2,
        maxX: toolSetup.operar.posicao.x + toolSetup.operar.dimensao.x / 2,
        minY: toolSetup.operar.posicao.y - toolSetup.operar.dimensao.y / 2,
        maxY: toolSetup.operar.posicao.y + toolSetup.operar.dimensao.y / 2,
      };

      resultado = entitiesInBounds(resultado, bounds);
    }

    return resultado;    
  }, [plantas, filters?.planta, activeTool, toolSetup.operar]);
  const canteirosFiltrados = useMemo(() => {
    let resultado = canteiros;
    if (filters?.canteiro?.estadoId) {
      resultado = resultado.filter(
        (canteiro) => canteiro.estadoId === filters.canteiro.estadoId
      );
    }
    if (
      activeTool === "operar" &&
      toolSetup.operar?.posicao &&
      toolSetup.operar?.dimensao
    ) {
      const bounds = {
        maxX:toolSetup.operar.posicao.x + toolSetup.operar.dimensao.x/2,
        maxY:toolSetup.operar.posicao.y + toolSetup.operar.dimensao.y/2,
        minX:toolSetup.operar.posicao.x - toolSetup.operar.dimensao.x/2,
        minY:toolSetup.operar.posicao.y - toolSetup.operar.dimensao.y/2,
      }
      resultado = entitiesInBounds(resultado, bounds);
    }
  return resultado;    
  }, [canteiros, filters?.canteiro, activeTool, toolSetup.operar]);

  // Handlers
  const handleFinishDrag = (evt) => {
    dragFinish(evt,svgRef);

    const funcaoCriarMap = {
      [ENTIDADE.canteiro.id]: criarCanteiro,
      [ENTIDADE.planta.id]: criarPlanta,
      [ENTIDADE.dispositivo.id]: criarDispositivo,
    }

    const startMap = getMouseInMapSpace(svgRef.current, gRef.current, drag.start.x, drag.start.y);
    const currentMap = getMouseInMapSpace(svgRef.current, gRef.current, drag.current.x, drag.current.y);
    //TODO: Clamp no grid

    if (activeTool === "selecionar") {
      // Calcula os limites
      const bounds = {
        minX: Math.min(startMap.x, currentMap.x),
        maxX: Math.max(startMap.x, currentMap.x),
        minY: Math.min(startMap.y, currentMap.y),
        maxY: Math.max(startMap.y, currentMap.y),
      };

      // Filtra a nova seleção
      const canteirosSelecionados = entitiesInBounds(canteirosFiltrados, bounds)
      const plantasSelecionadas = entitiesInBounds(plantasFiltradas, bounds)

      // Limpa e rafaz seleção
      selection.clear();
      canteirosSelecionados.forEach(canteiro => {
        const key = `${ENTIDADE.canteiro.id}:${canteiro.id}`;
        selection.add(key);
      });

      plantasSelecionadas.forEach(planta => {
        const key = `${ENTIDADE.planta.id}:${planta.id}`;
        selection.add(key);
      });
    }
    else if (activeTool === "mover") {
      if (drag.type === "mover") {
        const posicoes = {
          [drag.entidade.id]: {
            x: drag.entidade.posicao.x + (currentMap.x - startMap.x),
            y: drag.entidade.posicao.y + (currentMap.y - startMap.y),
            z: drag.entidade.posicao.z,
          }
        }
        movimentar({
          tipoEntidadeId: drag.tipoEntidadeId,
          entidades: [drag.entidade],
          posicoes,
          services: {
            batch: batchService,
            eventos: eventosService,
            entidade: entidadesService(drag.tipoEntidadeId),
            mutacoes: mutacoesService,
          },
          user,
          timestamp: Date.now()
        })
      }
      if (drag.type === "redimensionar") {
        const dimensoes = {
          [drag.entidade.id]: {}
        }
        let resized = {};
        switch (drag.entidade.aparencia.geometria) {
          case GEOMETRIA.rect.id:
            const rect = rectFromEntity(drag.entidade);
            resized = resizeRect({rect, direction: drag.direction, currentMap});
            dimensoes[drag.entidade.id] = {
              x: resized.w,
              y: resized.h,
              z: drag.entidade.dimensao.z,
            }
            break;
          case GEOMETRIA.circle.id:
            const circle = circleFromEntity(drag.entidade);
            resized = resizeCircleRadius({circle, direction: drag.direction, currentMap});
            dimensoes[drag.entidade.id] = {
              x: resized.r * 2,
              y: resized.r * 2,
              z: drag.entidade.dimensao.z,
            }
            break;
          default:
            throw new Error(`Geometria ${drag.entidade.aparencia.geometria} sem resize.`);
        }
        const posicoes = {
          [drag.entidade.id]: {
            x: resized.cx,
            y: resized.cy,
            z: drag.entidade.posicao.z,
          }
        }
        redimensionar({
          tipoEntidadeId: drag.tipoEntidadeId,
          entidades: [drag.entidade],
          dimensoes,
          posicoes,
          services: {
            batch: batchService,
            eventos: eventosService,
            entidade: servicesMap[drag.tipoEntidadeId],
            mutacoes: mutacoesService,
          },
          user,
          timestamp: Date.now()
        });
      }
    }
    else if (activeTool === "desenhar") {
      const tipoEntidadeId = toolSetup.desenhar.tipoEntidadeId
      const entidade = {
        nome: `Novo ${tipoEntidadeId}`,
        descricao: `Criado pelo mapa em ${Date.now()}`,
        posicao: {
          x: (startMap.x + currentMap.x)/2,
          y: (startMap.y + currentMap.y)/2,
          z: 0,
        },
        hortaId: horta.id,
        aparencia: {
          geometria: toolSetup.desenhar.geometria
        },
        dimensao: {
          x: Math.abs(currentMap.x - startMap.x),
          y: Math.abs(currentMap.y - startMap.y),
          z: 0
        }
      };
      const data = funcaoCriarMap[tipoEntidadeId]({entidade})
      setShowModal({
        tipoEntidadeId,
        data,
      })
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
      case "mover":
        // dragStart não ocorre no canvas, mas na entidade
        // pode ser tipo redimensionar ou tipo mover
        break
      default:
        console.warn("Tool sem drag start handler:", activeTool);
    }
  }
  const handleContextMenu = (evt, tipo, entidade) => {
    const opcoesPorTipo = {
      planta: [
        { label: "Editar planta", onClick: ()=>{
          setContextMenu(null)
          setShowModal({
            tipo: ENTIDADE.planta.id,
            data: entidade
          })}
        },
      ],
      canteiro: [
        { label: "Editar canteiro", onClick: ()=>{
          setContextMenu(null)
          setShowModal({
            tipo: ENTIDADE.canteiro.id,
            data: entidade
          })}
        },
      ],
      dispositivo: [
        { label: "Editar dispositivo", onClick: ()=>{
          setContextMenu(null)
          setShowModal({
            tipo: ENTIDADE.dispositivo.id,
            data: entidade
          })}
        },
      ]
    };
    let opcoes = opcoesPorTipo[tipo];
    if (activeTool == "operar") {
      if (entidade.id == toolSetup.operar.id) {
        opcoes.push({
          label: "Finalizar operação",
          onClick: ()=>{
            setTool(null);
            setContextMenu(null)
          }
        });
      }
      else {
        const bounds = {
          maxX:toolSetup.operar.posicao.x + toolSetup.operar.dimensao.x/2,
          maxY:toolSetup.operar.posicao.y + toolSetup.operar.dimensao.y/2,
          minX:toolSetup.operar.posicao.x - toolSetup.operar.dimensao.x/2,
          minY:toolSetup.operar.posicao.y - toolSetup.operar.dimensao.y/2,
        }
        if (tipo === ENTIDADE.dispositivo.id) {
          opcoes.push({
            label: "Operar", onClick: ()=>{
              setTool("operar");
              setToolState(entidade);
              setContextMenu(null)
            }
          });
        }
        if (entitiesInBounds([entidade], bounds).length > 0) {opcoes = opcoes.concat(
          criarContextoDispositivo({
            dispositivo: toolSetup.operar,
            tipoAlvo: tipo,
            entidade,
            user,
            onHide: ()=>{setContextMenu(null)},
            servicesMap,
          })
        );}
      }
    }
    else {
      opcoes.push({
        label: "Operar", onClick: ()=>{
          setTool("operar");
          setToolState(entidade);
          setContextMenu(null)
        }
      });
    }
    setContextMenu({
      x: evt.clientX,
      y: evt.clientY,
      opcoes,
      entidade,
    });
  };


  // Render
  if (loading) return <Loading variant="overlay" />
  if (!horta) return <div>Nada por aqui...</div>
  
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
        style = {{
          touchAction: "none"
        }}
        onPointerDown={(evt)=>{if (dragActive) handleStartDrag(evt)}}
        onPointerMove={(evt)=>{if (dragActive) dragMove(evt)}}
        onPointerUp={(evt)=>{if (dragActive) handleFinishDrag(evt)}}        
      >
        <g ref={gRef} >
          <MapaHorta
            horta={horta}
            svgRef={svgRef.current}
            gRef={gRef.current}
          />
          {dispositivos.map((disp) => (
            <MapaDispositivo
              key={disp.id}
              dispositivo={disp}
              svgRef={svgRef}
              gRef={gRef}
              drag={drag}
              dragStart={dragStart}
              dragMove={dragMove}
              centerOn={centerOn}
              focusOn={focusOn}
              onContextMenu={handleContextMenu}
              destaque={activeTool === "operar" && toolSetup.operar?.id === disp.id}
            />
          ))}
          {canteirosFiltrados.map((cant) => (
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
              onContextMenu={handleContextMenu}
            />
          ))}
          {plantasFiltradas.map((plan) => (
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
              onContextMenu={handleContextMenu}
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
      {contextMenu && (
        <MapaContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          entidade={contextMenu.entidade}
          opcoes={contextMenu.opcoes}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}