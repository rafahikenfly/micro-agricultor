import { useEffect, useMemo, useState } from "react";
import { Container } from "react-bootstrap";

import { useAuth } from "../../services/auth/authContext";
import { tarefasService } from "../../services/crud/tarefasService";
import { eventosService } from "../../services/history/eventosService";

import CalendarioGridSemana from "./views/CalendarioGridSemana";
import CalendarioGridMes from "./views/CalendarioGridMes";

import CalendarioToolbar from "./ui/CalendarioToolbar";

import { NoUser } from "../../components/common/NoUser";

import "./calendario.css";
import { CalendarioProvider } from "./CalendarioContexto";
import { useCalendarioEngine } from "./CalendarioEngine";
import CalendarioGridDia from "./views/CalendarioGridDia";
import { MonitorarModal } from "./actions/MonitorarModal";
import Loading from "../../components/common/Loading";
import { catalogosService } from "../../services/catalogosService";
import { useToast } from "../../services/toast/toastProvider";
import { canteirosService } from "../../services/crud/canteirosService";
import { plantasService } from "../../services/crud/plantasService";
import CalendarioAgenda from "./views/CalendarioAgenda";
import TarefaModal from "../admin/tarefas/TarefaModal";

function CalendarioConteudo () {
  const { toastMessage } = useToast();
  const { user } = useAuth();
  if (!user) return <NoUser />;

  const engine = useCalendarioEngine();

  const [eventos, setEventos] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [canteiros, setCanteiros] = useState([]);
  const [plantas, setPlantas] = useState([]);
  const [reading, setReading] = useState(true);

  /* ================== CARREGAR DADOS ================== */
  // Assinatura
  useEffect(() => {

    setLoading(true);
    let loaded = 0;
    const total = 4;

    const markLoaded = () => {
      loaded++;
      if (loaded === total) setLoading(false);
    };

    const unsubEventos = eventosService.subscribe((data) => {
      setEventos(data);
      markLoaded();
    });

    const unsubCanteiros = canteirosService.subscribe((data) => {
      setCanteiros(data);
      markLoaded();
    });

    const unsubPlantas = plantasService.subscribe((data) => {
      setPlantas(data);
      markLoaded();
    });

    const unsubTarefas = tarefasService.subscribe((data) => {
      setTarefas(data);
      markLoaded();
    });


    return () => {
      unsubEventos();
      unsubCanteiros();
      unsubPlantas();
      unsubTarefas();
    };

  }, []);
  // Catalogos
  useEffect(() => {

    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getCaracteristicas(),
    ]).then(([carac, ]) => {
      if (!ativo) return;
      setCaracteristicas(carac);
    })
    .catch((err) => {
      console.error(err);
      toastMessage({
        body: "Erro ao carregar catálogos.",
        variant: VARIANT_TYPES.RED
      });
    })
    .finally(() => {
      if (ativo) setReading(false);
    });
  
    return () => { ativo = false };
  }, []);


  /* ================= NORMALIZAÇÃO ================= 
    const calendarItems = useMemo(() => {
      const eventosNormalizados = eventos.map(ev => ({
        id: ev.id,
        type: "evento",
        title: ev.tipoEventoNome,
        timestamp: ev.timestamp,
        categoria: ev.categoria,
        entidadesIds: ev.alvos || [],
      }));

      const tarefasNormalizadas = tarefas.map(t => ({
        id: t.id,
        type: "tarefa",
        title: t.nome,
        timestamp: t.planejamento.vencimento,
        status: t.estado,
        entidadesIds: t.contexto.alvos || [],
      }));

      return [...eventosNormalizados, ...tarefasNormalizadas];

    }, [eventos, tarefas]);
  */

  if (loading) return <Loading />

  //TODO: filtragem por showEventos/showTarefas junto com demais filtros
  return (
    <Container>
      {engine.isSemana && <CalendarioGridSemana
        eventos={engine.showEventos ? eventos : []}
        tarefas={engine.showTarefas ? tarefas : []}
      />}
      {engine.isMes && <CalendarioGridMes
        eventos={engine.showEventos ? eventos : []}
        tarefas={engine.showTarefas ? tarefas : []}
      />}
      {engine.isDia && <CalendarioGridDia
        eventos={engine.showEventos ? eventos : []}
        tarefas={engine.showTarefas ? tarefas : []}
      />}
      {engine.isAgenda && <CalendarioAgenda
        eventos={engine.showEventos ? eventos : []}
        tarefas={engine.showTarefas ? tarefas : []}
      />}

      <CalendarioToolbar />

      <MonitorarModal
        key="monitorar"
        show={engine.showModalMonitorar}
        onClose={()=>engine.setShowModalMonitorar(false)}
        tarefa={engine.state.modalData}
        caracteristicas={caracteristicas}
        canteiros={canteiros}
        plantas={plantas}
        loading={reading}
      />
      <TarefaModal
        key="editar"
        show={engine.showModalTarefa}
        data={engine.state.modalData}
        onClose={()=>engine.setShowModalTarefa(false)}
      />
    </Container>
  )
}

export function Calendario() {
  return (
    <CalendarioProvider>
      <CalendarioConteudo />
    </CalendarioProvider>
  );
}


/*
export default function AppCalendario() {
  const {user} = useAuth();
  if (!user?.acesso?.usuario) return <NoAccess ambiente={"calendario"} />;




  /* ================= FILTRAGEM =================

  const itensFiltrados = useMemo(() => {

    return calendarItems.filter(item => {

      if (filtros.categorias.length > 0 && item.type === "evento") {
        if (!filtros.categorias.includes(item.categoria)) return false;
      }

      if (filtros.statusTarefa.length > 0 && item.type === "tarefa") {
        if (!filtros.statusTarefa.includes(item.status)) return false;
      }

      if (filtros.entidades.length > 0) {
        const intersect = item.entidadesIds?.some(id =>
          filtros.entidades.includes(id)
        );
        if (!intersect) return false;
      }

      return true;
    });

  }, [calendarItems, filtros]);

  if (loading) return <Loading />;

  return (
    <Calendario
      itens={itensFiltrados}
      filtros={filtros}
      setFiltros={setFiltros}
    />
  );
}
  */