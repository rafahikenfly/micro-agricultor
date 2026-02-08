import ToolBar from "../../../components/common/ToolBar";
import { useMapaEngine } from "../MapaEngine";

export default function MapaToolbar() {
  const {
    state,
    isPlantMode,
    showActionPanel,
    openConfigPanel,
    activatePlantTool,
    isForceRotate,
    activateRotateTool,
    isForcePan,
    activatePanTool,
    resetTools,
  } = useMapaEngine();

  const tools = [
    /*
    {
      id: "zoom",
      label: "🔎",
      toggle: state.hasZooming,
      onClick: toggleZoom
    },
    {
      id: "grid",
      label: "⬛",
      toggle: state.gridArray.length > 0,
      onClick: toggleGrid
    },
    {
      id: "retangulo",
      label: "▭",
      onClick: activateDrawRect
    },
    {
      id: "circulo",
      label: "◯",
      onClick: activateDrawCircle
    },
    */
    {
      id: "plantar",
      label: "🌱",
      onClick: !isPlantMode ? activatePlantTool
        : !showActionPanel ? openConfigPanel
        : resetTools

    },
    {
      id: "pan",
      label: "🖐️",
      onClick: isForcePan ? resetTools : activatePanTool,
    },
    {
      id: "rotate",
      label: "R",
      onClick: isForceRotate ? resetTools : activateRotateTool,
    },

  ];

  return <ToolBar tools={tools} activeTool={state.activeTool} />;
}