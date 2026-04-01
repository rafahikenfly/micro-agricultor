import { ENTIDADE, GEOMETRY_TYPES } from "micro-agricultor";

import { useCache } from "../../../hooks/useCache";
import { useMapaEngine } from "../MapaEngine";

import PainelMonitorar from "./PainelMonitorar";
import PainelInspecionar from "./PainelInspecionar";
import PainelFotografar from "./PainelFotografar";
import { Offcanvas } from "react-bootstrap";
import { resolvePrimarySelection, resolveSelection } from "../../../utils/catalogUtils";
import { calcularArea } from "../../../utils/geometryUtils";
import PainelManejar from "./PainelManejar";
import { pluralizar } from "../../../utils/uiUtils";
import PainelDesenhar from "./PainelDesenhar";
import PainelPlantar from "./PainelPlantar";

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
  const { cachePlantas, cacheCanteiros, reading } = useCache([
    "plantas",
    "canteiros"
  ]);
  if (!activeTool) return null;

  // DEFINIÇÃO DE PAINEIS
  const TOOL_PANELS = {
    plantar: PainelPlantar,
    desenhar: PainelDesenhar,
    monitorar: PainelMonitorar,
    inspecionar: PainelInspecionar,
    fotografar: PainelFotografar,
    manejar: PainelManejar,
  };
  const OffcanvasContent = TOOL_PANELS[activeTool] || null;
  if (!OffcanvasContent) return null;


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
    inspecionar: (toolState)=>console.log("inspecionar", toolState),
    fotografar: (toolState)=>console.log("fotografar", toolState),
    manejar: (toolState)=>console.log("manejar",toolState)
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

      <Offcanvas
        show={showPainel}
        onHide={()=>setShowPainel(false)}
        placement="end"
        backdrop={false}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{offcanvasHeader({
            selection,
            caches: {
              [ENTIDADE.planta.id]: cachePlantas,
              [ENTIDADE.canteiro.id]: cacheCanteiros,
            },
            primary: false})}
            </Offcanvas.Title>
        </Offcanvas.Header>
    
        <Offcanvas.Body>
          <OffcanvasContent
            show={showPainel}
            data={toolSetup[activeTool]}
            selection={selection}
            primary={selection.primary}
            primaryType={selection.primaryType()}
            caches={{
              [ENTIDADE.planta.id]: cachePlantas,
              [ENTIDADE.canteiro.id]: cacheCanteiros,
            }}
            reading={reading}
            onConfirm={TOOL_ONCONFIRM[activeTool]}
            onCancel={() => {resetToolState(); resetTool()}}
            onClose={() => setShowPainel(false)}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}



export function offcanvasHeader ({tipoEntidadeId, selection, caches, primary = false}) {
  if (!selection.primary) return <div><strong>Nenhuma seleção</strong></div>
  const last = resolvePrimarySelection(selection, caches)
  if (primary) return (
    <div>
      <strong>{last.nome}</strong>
      <div className="text-muted small">
          {(calcularArea(last)/10000).toFixed(2)} m²
      </div>
    </div>
  )
  if (!tipoEntidadeId) tipoEntidadeId = selection.primaryType()

  const list = resolveSelection(selection, tipoEntidadeId, caches[tipoEntidadeId])
  const displayArea = list.reduce((acc, sel) => {
      return acc + calcularArea(sel);
    }, 0);

  let displayNome = last?.nome ?? `Sem ${tipoEntidadeId}s na seleção`
  if (list.length > 1) displayNome =
  `${last?.nome} e mais ${list.length - 1} ${pluralizar(list.length-1,tipoEntidadeId)}`

  return ( <div>
      <strong>{displayNome}</strong>
      <div className="text-muted small">
          {(displayArea/10000).toFixed(2)} m²
      </div>
    </div>
  )
}