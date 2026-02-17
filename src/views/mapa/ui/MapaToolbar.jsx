import ToolBar from "../../../components/common/ToolBar";
import { useMapaEngine } from "../MapaEngine";

export default function MapaToolbar() {
  const {
    state,
    isPlantMode,
    isEditMode,
    isViewMode,
    openConfigPanel,
    activatePlantTool,
    activateMonitorTool,
    activateInspectTool,
    activateHandleTool,
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
        : !state.showConfigPanel ? openConfigPanel
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
    {
      id: "monitor",
      label: "M",
      onClick: state.activeTool !== "monitor" ? activateMonitorTool
        : !state.showConfigPanel ? openConfigPanel
        : resetTools
    },
    {
      id: "inspect",
      label: "I",
      onClick: state.activeTool !== "inspect"  ? activateInspectTool
        : !state.showConfigPanel ? openConfigPanel
        : resetTools
    },

    {
      id: "handle",
      label: "H",
      onClick:  state.activeTool !== "handle"  ? activateHandleTool
        : !state.showConfigPanel ? openConfigPanel
        : resetTools
    },
  ];

  return <ToolBar tools={tools} activeTool={state.activeTool} />;
}