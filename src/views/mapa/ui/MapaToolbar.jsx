import ToolBar from "../../../components/common/ToolBar";
import { useMapaEngine } from "../MapaEngine";

export default function MapaToolbar() {
  const {
    state,
    isPlacing,
    activatePlantTool,
    isDrawing,
    activateDrawTool,
    showConfigPanel,
    openConfigPanel,
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
    { id: "pan",
      label: "🖐️",
      onClick: isForcePan ? resetTools : activatePanTool,
    },
    { id: "rotate",
      label: "⤵",
      onClick: isForceRotate ? resetTools : activateRotateTool,
    },
    {
      id: "plant",
      label: "🌱",
      onClick: !isPlacing ? activatePlantTool
        : !showConfigPanel ? openConfigPanel
        : resetTools
    },
    {
      id: "draw",
      label: "📐",
      onClick: !isDrawing ? activateDrawTool
        : !showConfigPanel ? openConfigPanel
        : resetTools
    },
    {
      id: "monitor",
      label: "🔬",
      onClick: state.activeTool !== "monitor" ? activateMonitorTool
        : !state.showConfigPanel ? openConfigPanel
        : resetTools
    },
    {
      id: "handle",
      label: "🪏",
      onClick:  state.activeTool !== "handle"  ? activateHandleTool
        : !state.showConfigPanel ? openConfigPanel
        : resetTools
    },
    {
      id: "inspect",
      label: "🗺",
      onClick: state.activeTool !== "inspect"  ? activateInspectTool
        : !state.showConfigPanel ? openConfigPanel
        : resetTools
    },

  ];

  return <ToolBar tools={tools} activeTool={state.activeTool} />;
}