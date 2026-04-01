import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useMapaEngine } from "../MapaEngine";
import { VARIANT_TYPES } from "micro-agricultor";

export default function MapaSidebar() {

  const {
    activeTool,
    setTool,
    resetTool,
    setMapDrag,
    setMapDragActive,
    setMapPreviewActive,
    setShowPainel,
  } = useMapaEngine();

  // TODO: KNOWN BUGS e APRIMORAMENTOS
  // 1. Se o mouseUp ocorrer fora do SVG, não processa a seleção.
  // isso atrapalha a seleção de itens que estejam na borda do mapa.
  // 2. A ação de seleção nem sempre está disponível, mas deveria.
  // 3. Move e Resize deveria ser apenas no caso da entidade primaria selecionada.
  // 4. Preview poderia indicar graficamente se está ou não sobre uma entidade que
  // permite a ação (ex: plantar só pode acontecer em um canteiro).
  // 5. Tipar as ferramentas para simplificar os handlers nas entidade.
  // 6. Heatmap/inspeção não está programada e tem uns artefatos espalhados.

  const tools = [
    {id: "selecionar",
      icon: "[]",
      text: "Selecionar",
      onClick: activeTool === "selecionar" ? resetTool : ()=>{
        setTool("selecionar");
        setMapPreviewActive(false);
        setMapDrag({
          active: true,
          geometry: "rect",
          preview: {
            fill: "rgba(0, 123, 255, 0.2)",
            stroke: "rgba(0, 123, 255, 0.9)",
            strokeWidth: 1,
            strokeDasharray: "6 4",
            pointerEvents: "none",
          },
        });
      }
    },
    {
      id: "plantar",
      icon: "🌱",
      text: "Plantar",
      onClick: activeTool === "plantar" ? resetTool : ()=>{
        setMapDragActive(false);
        setTool("plantar");
        //setMapPreview pelo painel
        setShowPainel(true);
      }
    },
    {id: "desenhar",
      icon: "📐",
      text: "Desenhar (canteiros e outras entidades)",
      onClick: activeTool === "desenhar" ? resetTool : ()=>{
        //setMapDrag pelo painel
        setMapPreviewActive(false);
        setTool("desenhar");
        setShowPainel(true);
      }
    },
    {
      id: "mover",
      icon: "🖐️",
      text: "Mover",
      onClick: activeTool === "mover" ? resetTool : () => {
        //setMapDrag pelo canva
        setMapPreviewActive(false);
        setTool("mover")
        setShowPainel(true);
      },
    },
    {
      id: "fotografar",
      icon: "📷",
      text: "Fotografar entidade",
      onClick: activeTool === "fotografar" ? () => setShowPainel(false) : () => {
        setMapDragActive(false);
        setMapPreviewActive(false);
        setTool("fotografar");
        setShowPainel(true);
      },
    },
    {
      id: "monitorar",
      icon: "🔬",
      text: "Monitorar características",
      onClick: activeTool === "monitorar" ? resetTool : () => {
        setMapDragActive(false);
        setMapPreviewActive(false);
        setTool("monitorar");
        setShowPainel(true);
      },
    },
    {
      id: "inspecionar",
      icon: "🗺",
      text: "Inspecionar características",
      onClick: activeTool ===  "inspecionar" ? resetTool : () => {
        setMapDragActive(false);
        setMapPreviewActive(false);
        setTool("inspecionar");
        setShowPainel(true);
      }
    },     
    {
      id: "manejar",
      icon: "🪏",
      text: "Manejar",
      onClick: activeTool ===  "manejar" ? resetTool : () => {
        setMapDragActive(false);
        setMapPreviewActive(false);
        setTool("manejar");
        setShowPainel(true);
      }
    },
  ];

  return (
    <div
      className="d-flex flex-column bg-light border-end p-2 align-items-center"
      style={{ width: "60px" }}
    >
      {tools.map(tool => (
        <OverlayTrigger
            key={tool.id}
            placement="right"
            overlay={<Tooltip>{tool.text}</Tooltip>}
        >
            <Button
            variant={activeTool === tool.id ? VARIANT_TYPES.GREEN : VARIANT_TYPES.WHITE}
            className="mb-2 d-flex align-items-center justify-content-center"
            style={{
                width: "40px",
                height: "40px",
                fontSize: "20px"
            }}
            onClick={tool.onClick}
            >
            {tool.icon}
            </Button>
        </OverlayTrigger>
      ))}
    </div>
  );
}