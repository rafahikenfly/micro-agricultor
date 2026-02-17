import { useEffect, useMemo, useState } from "react";
import { MapaProvider, MODOS_MAPA } from "./MapaContexto";
import { useMapaEngine } from "./MapaEngine";
import { useAuth } from "../../services/auth/authContext";
import { canteirosService } from "../../services/crud/canteirosService";
import { plantasService } from "../../services/crud/plantasService";
import { createMapaInputHandler } from "./handlers/MapaInput.handlers"
import MapaHorta from "./ui/MapaHorta";
import MapaPlanta from "./ui/MapaPlanta";
import MapaCanteiro from "./ui/MapaCanteiro";
import { NoUser } from "../../components/common/NoUser";
import PlantarOffcanvas from "./actions/PlantarOffcanvas";
import MapaToolbar from "./ui/MapaToolbar";
import MapaPreview from "./ui/MapaPreview";
import { Container } from "react-bootstrap";
import { AppToastConfirmacao, AppToastMensagem } from "../../components/common/toast";
import MapaBussola from "./ui/MapaBussola";
import MonitorarOffcanvas from "./actions/MonitorarOffcanvas";
import InspecionarOffCanvas from "./actions/InspecionarOffCanvas";
import ManejarOffCanvas from "./actions/ManejarOffCanvas";

function MapaConteudo({ horta }) {
  const { user } = useAuth();
  if (!user) return <NoUser />;
  if (!horta) return <div>Nada por aqui...</div>

  const engine = useMapaEngine();
  const handlers = createMapaInputHandler(engine, engine.state);
  const { transform, } = engine.state;

//  const [horta, setHorta] = useState(horta);
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
      .forParent(horta.id)
      .subscribe((data) => {
        setCanteiros(data);
        setLoadingCanteiros(false);
      }, [
      {field: "isDeleted", op: "==", value: false},
    ]);

    return () => unsub();
  }, [horta?.id]);

  const canteirosSelecionados = useMemo(() => {
    if (!engine.state.selection?.length) return [];

    const canteirosById = Object.fromEntries(
      canteiros.map(c => [c.id, c])
    );
    return engine.state.selection
      .filter(sel => sel.tipoEntidadeId === "canteiro")
      .map(sel => {
        const canteiro = canteirosById[sel.entidadeId];
        if (!canteiro) return null;

        return {
          data: canteiro,
          tipoEntidadeId: "canteiro"
        };
      })
      .filter(Boolean);
  }, [engine.state.selection, canteiros]);

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
    if (!engine.state.selection?.length) return [];

    const plantasById = Object.fromEntries(
      plantas.map(c => [c.id, c])
    );
    return engine.state.selection
      .filter(sel => sel.tipoEntidadeId === "planta")
      .map(sel => {
        const planta = plantasById[sel.entidadeId];
        if (!planta) return null;

        return {
          data: planta,
          tipoEntidadeId: "planta"
        };
      })
      .filter(Boolean);
  }, [engine.state.selection, plantas]);


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
          await canteirosService.forParent(horta.id).remove(item.data.id,user);
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
  const canteirosExibidos = canteiros.filter((a)=>true);
  const plantasExibidas = plantas.filter((a)=>true);

  //console.log("MAPA RENDER:", engine.state.selection)
  return (
    <Container>
      <div
        style={{ width: "90vw", height: "90vh", overflow: "hidden", border: "solid black 1px"}}
        onWheel={handlers.onWheel}
        onMouseMove={handlers.onMouseMove}
      >
        <svg width="100%" height="100%">

          {/* grupo transformado */}
          <g
            transform={`
              translate(${transform.x} ${transform.y})
              rotate(${transform.rotate})
              scale(${transform.scale})
            `}
          >
            <MapaHorta horta={horta} />
            {canteirosExibidos.map((cant) => (
              <MapaCanteiro key={cant.id} canteiro={cant} showToast={showToast}/>
            ))}
            {plantasExibidas.map((plan) => (
              <MapaPlanta key={plan.id} planta={plan} showToast={showToast}/>
            ))}
            <MapaPreview />
          </g>
        </svg>
        <PlantarOffcanvas
          show={engine.state.activeAction === MODOS_MAPA.PLANT && engine.state.showConfigPanel}
          onConfirm={(config) => engine.configAction(config)}
          onCancel={engine.resetAction}
          onClose={engine.closeConfigPanel}
        />
        <MonitorarOffcanvas
          show={engine.state.activeTool === "monitor" && engine.state.showConfigPanel}
          selection={[...canteirosSelecionados, ...plantasSelecionadas]}
          onClose={engine.closeConfigPanel}
          showToast={showToast}
        />
        <InspecionarOffCanvas
          show={engine.state.activeTool === "inspect" && engine.state.showConfigPanel}
          tipoEntidadeId={"canteiro" /*TODO: ARRUMAR PARA OUTRAS ENTIDADES*/}
          onClose={engine.closeConfigPanel}
          showToast={showToast}
          onActivate={(config)=>engine.configAction(config)}
          onDeactivate={()=>engine.configAction({
            ...engine.state.actionConfig,
            inspect: false,
          })}
        />
        <ManejarOffCanvas
          show={engine.state.activeTool === "handle" && engine.state.showConfigPanel}
          selection={[...canteirosSelecionados, ...plantasSelecionadas]}
          onClose={engine.closeConfigPanel}
          showToast={showToast}
        />

        <MapaBussola />
        <MapaToolbar />
      </div>
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