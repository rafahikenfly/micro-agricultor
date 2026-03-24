import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useMapaEngine } from "../MapaEngine";
import { VARIANT_TYPES } from "micro-agricultor";

export default function MapaSidebar() {

  const {
    activeTool,
    setTool,
    resetTool,
    setMapDrag,
    setMapPreviewActive,
    setShowPainel,
  } = useMapaEngine();

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
        //setmapdragactive(false)
        setTool("plantar");
        //setMapPreview no painel
        setShowPainel(true);
      }
    },
    {id: "desenhar",
      icon: "📐",
      text: "Desenhar (canteiros e outras entidades)",
      onClick: activeTool === "desenhar" ? resetTool : ()=>{
        setMapPreviewActive(false);
        setTool("desenhar");
        //setmapdrag no painel
        setShowPainel(true);
      }
    },
    {
      id: "mover",
      icon: "🖐️",
      text: "Mover",
      onClick: activeTool === "mover" ? resetTool : () => {
        setMapPreviewActive(false);
        //setmapdrag no canva
        setTool("mover")
        setShowPainel(true);
      },
    },
    {
      id: "fotografar",
      icon: "📷",
      text: "Fotografar entidade",
      onClick: activeTool === "fotografar" ? () => setShowPainel(false) : () => {
        //setmapdragactive(false)
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
        //setmapdragactive(false)
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
        //setmapdragactive(false)
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
        //setmapdragactive(false)
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