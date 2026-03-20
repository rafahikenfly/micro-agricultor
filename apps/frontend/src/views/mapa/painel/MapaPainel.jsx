import { ENTITY_TYPES, GEOMETRY_TYPES } from "micro-agricultor";

import { useCatalogos } from "../../../hooks/useCatalogos";
import { useMapaEngine } from "../MapaEngine";

import PlantarOffcanvas from "./PlantarOffcanvas";
import DesenharOffcanvas from "./DesenharOffCanvas";
import MonitorarOffcanvas from "./MonitorarOffCanvas";
import InspecionarOffCanvas from "./InspecionarOffCanvas";

export default function MapaPainel() {
  const {
    activeTool,
    resetTool,
    setToolState,
    resetToolState,
    toolSetup,
    showPainel,
    setShowPainel,
    setMapDrag,
    setMapPreview,
    selection,
  } = useMapaEngine();
  const { catalogoPlantas, catalogoCanteiros, reading } = useCatalogos([
    "plantas",
    "canteiros"
  ]);
  if (!activeTool) return null;

  // DEFINIÇÃO DE PAINEIS
  const TOOL_PANELS = {
    plantar: PlantarOffcanvas,
    desenhar: DesenharOffcanvas,
    monitorar: MonitorarOffcanvas,
    inspecionar: InspecionarOffCanvas,
  };
  const PanelComponent = TOOL_PANELS[activeTool] || null;
  if (!PanelComponent) return null;


  // DEFINIÇÃO DE CONFIRMAÇÕES
  // as ações acontecem no canvas. Aqui mora apenas a configuração da ação.
  const TOOL_ONCONFIRM = {
    plantar: (toolState, layout)=>{
      //Configura estado da ferramenta
      setToolState(toolState);
      // Configura o preview
      setMapPreview({
        active: true,
        layout,
        entidade: toolState.metadata.variedade,
      });
    },
    desenhar: (toolState)=>{
      setToolState(toolState);
      setMapDrag({
        active: true,
        geometry: toolState.geometria ?? GEOMETRY_TYPES.RECT,
        preview: {
          fill: "rgba(42, 22, 4, 0.2)",
          stroke: "rgba(17, 90, 24, 0.9)",
          strokeWidth: 1,
          strokeDasharray: "6 4",
          pointerEvents: "none",
        },
      });
      
    },
    monitorar: (toolState)=>console.log("monitorar", toolState),
    inspecionar: (toolState)=>console.log("inspecionar", toolState)
  }

return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 50,
        height: "80%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        zIndex: 1000,
      }}
    >
      {/* Botão de toggle sempre visível */}
      <button
        onClick={() => setShowPainel((prev) => !prev)}
        style={{
          width: 40,
          height: 40,
          margin: 10,
          borderRadius: "50%",
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer",
          transform: showPainel ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s",
        }}
      >
        ➤
      </button>

      {showPainel && (
        <div style={{ width: 300 }}>
          <PanelComponent
            show={showPainel}
            data={toolSetup[activeTool]}
            selection={selection}
            catalogos={{
              [ENTITY_TYPES.PLANTA]: catalogoPlantas,
              [ENTITY_TYPES.CANTEIRO]: catalogoCanteiros,
            }}
            reading={reading}
            onClose={() => setShowPainel(false)}
            onConfirm={TOOL_ONCONFIRM[activeTool]}
            onCancel={() => {resetToolState(); resetTool()}}
          />
        </div>
      )}
    </div>
  );
}