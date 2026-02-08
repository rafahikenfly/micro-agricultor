import { useEffect, useState } from "react";
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
import PlantarOffcanvas from "../../components/actions/PlantarOffcanvas";
import MapaToolbar from "./ui/MapaToolbar";
import MapaPreview from "./ui/MapaPreview";

function MapaConteudo({ horta }) {
  const { user } = useAuth();
  if (!user) return <NoUser />;
  if (!horta) return <div>Nada por aqui...</div>

  const engine = useMapaEngine();
  const handlers = createMapaInputHandler(engine, engine.state);
  const { transform } = engine.state;

//  const [horta, setHorta] = useState(horta);
  const [canteiros, setCanteiros] = useState ([]);
  const [plantas, setPlantas] = useState([]);

  const [loadingCanteiros, setLoadingCanteiros] = useState(true);
  const [loadingPlantas, setLoadingPlantas] = useState(true);
  const loading = loadingCanteiros || loadingPlantas;

    /* ================== CARREGAR DADOS ================== */
    // Canteiros
    useEffect(() => {
      if (!horta?.id) return;
  
      setLoadingCanteiros(true);

      const filtroCanteiros = [
        {field: "isDeleted", op: "==", value: false},
      ]
      const unsub = canteirosService
        .forParent(horta.id)
        .subscribe((data) => {
          setCanteiros(data);
          setLoadingCanteiros(false);
        }, filtroCanteiros);
      return unsub;
    }, [horta?.id]);

    // plantas
    useEffect(() => {
      if (!horta?.id) return;

      setLoadingPlantas(true);
      
      const filtroPlantas = [
        {field: "isDeleted", op: "==", value: false},
        {field: "hortaId", op: "==", value: horta.id},
      ]
      const unsub = plantasService
      .subscribe((data) => {
        setPlantas(data);
        setLoadingPlantas(false);
      },filtroPlantas);
      return unsub;
    }, [horta?.id]);
  

  const canteirosExibidos = canteiros.filter((a)=>true);
  const plantasExibidas = plantas.filter((a)=>true);
  
  return (
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
            <MapaCanteiro key={cant.id} canteiro={cant} />
          ))}
          {plantasExibidas.map((plan) => (
            <MapaPlanta key={plan.id} planta={plan} />
          ))}
          <MapaPreview />
        </g>
      </svg>
      <PlantarOffcanvas
        show={engine.state.activeAction === MODOS_MAPA.PLANT && engine.showConfigPanel}
        onConfirm={(config) => engine.configAction({
          ...config,
          preview: {
            show: true,
            geometria: "circle",
            radius: config.layout.espacamentoLinha * 0.45,
          }})}
        onCancel={engine.resetAction}
        onClose={engine.closeConfigPanel}
      />
      <MapaToolbar />
    </div>
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