import { useEffect, useMemo, useRef, useState } from "react";
import { MapaProvider } from "../MapaContexto";
import { useMapaEngine } from "../MapaEngine";
import { useAuth } from "../../../services/auth/authContext";
import { canteirosService } from "../../../services/crud/canteirosService";
import { plantasService } from "../../../services/crud/plantasService";
import { createMapaInputHandler } from "./handlers/MapaInput.handlers"
import MapaHorta from "./ui/MapaHorta";
import MapaPlanta from "./ui/MapaPlanta";
import MapaCanteiro from "./ui/MapaCanteiro";
import { NoUser } from "../../../components/common/NoUser";
import PlantarOffcanvas from "./actions/PlantarOffcanvas";
import MapaToolbar from "./ui/MapaToolbar";
import MapaPreview from "./ui/MapaPreview";
import { Container } from "react-bootstrap";
import { AppToastConfirmacao, AppToastMensagem } from "../../../components/common/toast";
import MapaBussola from "./ui/MapaBussola";
import MonitorarOffcanvas from "./actions/MonitorarOffcanvas";
import InspecionarOffCanvas from "./actions/InspecionarOffCanvas";
import ManejarOffCanvas from "./actions/ManejarOffCanvas";
import CanteiroModal from "../../admin/canteiros/CanteiroModal";
import PlantaModal from "../../admin/plantas/PlantaModal";
import MapaDrag from "./ui/MapaDrag";
import DesenharOffcanvas from "./actions/DesenharOffCanvas";
import { salvarCanteiro } from "../../../services/application/canteiro.application";

function MapaConteudo({ horta }) {
  const { user } = useAuth();
  if (!user) return <NoUser />;
  if (!horta) return <div>Nada por aqui...</div>

  const engine = useMapaEngine();
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const handlers = createMapaInputHandler(engine, engine.state, svgRef.current,gRef.current);
  const { transform, } = engine.state;

  const [canteiros, setCanteiros] = useState ([]);
  const [plantas, setPlantas] = useState([]);

  const [loadingCanteiros, setLoadingCanteiros] = useState(true);
  const [loadingPlantas, setLoadingPlantas] = useState(true);
  const loading = loadingCanteiros || loadingPlantas;

  const [showToastMensagem, setShowToastMensagem] = useState(false);
  const [showToastConfirmacao, setShowToastConfirmacao] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("success");


  /* ================== CARREGAR DADOS ================== */
  // Canteiros
  useEffect(() => {
    if (!horta.id) return;

    setLoadingCanteiros(true);

    const unsub = canteirosService
      .subscribe((data) => {
        setCanteiros(data);
        setLoadingCanteiros(false);
      }, [
      {field: "isDeleted", op: "==", value: false},
      {field: "hortaId", op: "==", value: horta.id},
    ]);

    return () => unsub();
  }, [horta?.id]);

  const canteirosSelecionados = useMemo(() => {
    if (!engine.selectionCanteiros.length) return [];
    const canteirosById = Object.fromEntries(
      canteiros.map(c => [c.id, c])
    );

    return engine.selectionCanteiros
      .map(id => {
        const canteiro = canteirosById[id];
        if (!canteiro) return null;
        return canteiro;
      })
      .filter(Boolean);
  }, [engine.selectionCanteiros, canteiros]);

    // Plantas
    useEffect(() => {
      if (!horta.id) return;

      setLoadingPlantas(true);

      const unsub = plantasService.subscribe((data) => {
        setPlantas(data);
        setLoadingPlantas(false);
      }, [
        {field: "isDeleted", op: "==", value: false},
        {field: "hortaId", op: "==", value: horta.id},
      ]);

      return () => unsub();
    }, [horta?.id]);

    const plantasSelecionadas = useMemo(() => {
    if (!engine.selectionPlantas.length) return [];
    const plantasById = Object.fromEntries(
      plantas.map(c => [c.id, c])
    );
    return engine.selectionPlantas
      .map(id => {
        const planta = plantasById[id];
        if (!planta) return null;
        return planta;
      })
      .filter(Boolean);
  }, [engine.selectionPlantas, plantas]);


  /* ================== TOAST ================== */
  const showToast = (msg, variant = "success", confirmacao = false) => {
    setToastMsg(msg);
    setToastVariant(variant);
    setShowToastMensagem(!confirmacao);
    setShowToastConfirmacao(confirmacao);
  };
  const confirmarExclusao = () => {
    setShowToastConfirmacao(false);
    try {
      selecao.forEach(async (item) => {
        if (item.tipoEntidadeId === "canteiro") {
          await canteirosService.remove(item.data.id,user);
        }
        if (item.tipoEntidadeId === "planta") {
          await plantasService.remove(item.data.id,user);
        }
      });
      showToast(`Registros apagados com sucesso!`, "success");
    }
    catch (err) {
      console.error(err);
      showToast(`Erro ao apagar: ${err}`, "danger");
    }
    finally {
      setSelecao([]);
      setModo("edit");
    }
  };
  const canteirosExibidos = canteiros.filter((a)=>true); //TODO: filtro de canteiros
  const plantasExibidas = plantas.filter((a)=>true); //TODO: filtro de plantas

  //TODO: toasts
  const onSaveModal = async (data, tipoEntidadeId) => {
    engine.setPendingMutation({after: data})
    const saveHandlers = {
      canteiro: salvarCanteiro,
      horta: (data, user)=>console.log(data, user),
      planta: (data, user)=>console.log(data, user),
    };
    try {
      const save = saveHandlers[tipoEntidadeId];
      if (!save) { throw new Error(`Tipo de entidade não suportado: ${tipoEntidadeId}`); }
      await save({ data, user, mutation: engine.state.pendingMutation });
    } catch (err) {
      console.error(err,data,user);
    } finally {
      engine.hideModalCanteiro();
      engine.setModalData(null);
    }
  };

  return (
    <Container>
      <div
        style={{ width: "90vw", height: "90vh", overflow: "hidden", border: "solid black 1px"}}
        onWheel={handlers.onWheel}
        onMouseMove={(evt)=>handlers.onMouseMove(evt)}
        onMouseDown={handlers.onMouseDown}
        onMouseUp={handlers.onMouseUp}
      >
        <svg ref={svgRef} width="100%" height="100%">
          {engine.isPlacing && <text x="20" y="35" >Placing</text>}
          {engine.isResizing && <text x="20" y="55" >Resizing</text>}
          {engine.isDragging && <text x="20" y="75" >Dragging</text>}
          {/* grupo transformado */}
          <g
            ref={gRef}
            transform={`
              translate(${transform.x} ${transform.y})
              rotate(${transform.rotate})
              scale(${transform.scale})
            `}
          >
            <MapaHorta
              horta={horta}
              svgRef={svgRef.current}
              gRef={gRef.current}
            />
            {canteirosExibidos.map((cant) => (
              <MapaCanteiro
                key={cant.id}
                canteiro={cant}
                showToast={showToast}
                svgRef={svgRef.current}
                gRef={gRef.current}
              />
            ))}
            {plantasExibidas.map((plan) => (
              <MapaPlanta
                key={plan.id}
                planta={plan}
                showToast={showToast}
                svgRef={svgRef.current}
                gRef={gRef.current}
              />
            ))}
            {engine.showPreview && <MapaPreview />}
            {engine.showDrag && <MapaDrag />}
          </g>
        </svg>
        <PlantarOffcanvas
          show={engine.isPlacing && engine.state.placing.tipoEntidadeId === "planta" && engine.showConfigPanel}
          onConfirm={(config, preview) => {
            engine.placeUpdade(config); //UPDATE porque a entidade planta já vem do toolbox
            engine.previewStart(preview);
            engine.openPreview();
          }}
          onCancel={engine.placeReset}
          onClose={engine.hideConfigPanel}
        />
        <DesenharOffcanvas
          show={engine.isDrawing && engine.showConfigPanel}
          onConfirm={(config, drag) => {
            engine.drawStart(config, drag);
            engine.dragSetup(drag);
            engine.openDrag()
          }}
          onCancel={engine.resetAction}
          onClose={engine.hideConfigPanel}
        />
        <MonitorarOffcanvas
          show={engine.state.activeTool === "monitor" && engine.showConfigPanel}
          selectionData={{
            planta: plantasSelecionadas,
            canteiro: canteirosSelecionados,
          }}
          onClose={engine.hideConfigPanel}
          showToast={showToast}
        />
        <InspecionarOffCanvas
          show={engine.state.activeTool === "inspect" && engine.showConfigPanel}
          onClose={engine.hideConfigPanel}
          selectionData={{
            planta: plantasSelecionadas,
            canteiro: canteirosSelecionados,
          }}
          onActivate={(config)=>engine.heatmapSet(config)}
          onDeactivate={()=>engine.heatmapReset()}
          showToast={showToast}
        />
        <ManejarOffCanvas
          show={engine.state.activeTool === "handle" && engine.showConfigPanel}
          selectionData={{
            planta: plantasSelecionadas,
            canteiro: canteirosSelecionados,
          }}
          onClose={engine.hideConfigPanel}
          showToast={showToast}
        />

        <MapaBussola />
        <MapaToolbar />
      </div>
      {/* ================= MODAL ================= */}
      <CanteiroModal
        key="canteiro"
        show={engine.showModalCanteiro}
        onClose={engine.hideModalCanteiro}
        onSave={(data,tipoEntidadeId)=>onSaveModal(data,tipoEntidadeId)}
        data={engine.state.select.modalData}
        setToast={(toast) => setToast(toast, setShowToastMensagem)}
      />
      <PlantaModal
        key="planta"
        show={engine.showModalPlanta}
        onClose={engine.hideModalPlanta}
        onSave={(data,tipoEntidadeId)=>onSaveModal(data,tipoEntidadeId)}
        data={engine.state.select.modalData}
        setToast={(toast) => setToast(toast, setShowToastMensagem)}
      />
      {/*TODO: AJUSTAR TOAST DO MAPA PARA PADRÃO NOVO */}
      {/* ================= TOASTS ================= */}
      <AppToastMensagem
        show={showToastMensagem}
        onClose={() => setShowToastMensagem(false)}
        message={toastMsg}
        variant={toastVariant}
      />

      <AppToastConfirmacao
        show={showToastConfirmacao}
        onCancel={() => setShowToastConfirmacao(false)}
        onConfirm={confirmarExclusao}
        message={toastMsg}
        variant={toastVariant}
      />
    </Container>
  );
}

export function Mapa({ horta }) {
  if (!horta) return null
  return (
    <MapaProvider>
      <MapaConteudo horta={horta} />
    </MapaProvider>
  );
}