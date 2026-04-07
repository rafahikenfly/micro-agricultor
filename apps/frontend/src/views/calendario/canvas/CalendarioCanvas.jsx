import "./calendario.css";

import { useParams } from "react-router-dom";
import { NoUser } from "../../../components/common/NoUser";
import { useAuth } from "../../../services/auth/authContext";

import CalendarioAgenda from "../views/CalendarioAgenda";
import CalendarioDia from "../views/CalendarioDia";
import CalendarioSemana from "../views/CalendarioSemana";
import CalendarioMes from "../views/CalendarioMes";

import { useCalendarioEngine } from "../CalendarioEngine";
import { useCache } from "../../../hooks/useCache";
import { useEffect, useState } from "react";
import { eventosService } from "../../../services/historyService";
import { tarefasService } from "../../../services/crud/tarefasService";
import { necessidadesService } from "../../../services/crud/necessidadesService";

  const VIEW_COMPONENTS = {
    agenda: CalendarioAgenda,
    dia: CalendarioDia,
    semana: CalendarioSemana,
    mes: CalendarioMes,
  };
  
  export default function CalendarioCanvas () {
  const {cacheCanteiros, cachePlantas, cacheCaracteristisca, cacheManejos} = useCache([
    "canteiros",
    "plantas",
    "caracteristicas",
    "manejos",
  ])

  const [eventos, setEventos] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [necessidades, setNecessidades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  /* ================== CARREGAR DADOS ================== */
  // Assinatura
  useEffect(() => {

    setLoading(true);
    let loaded = 0;
    const total = 3;

    const markLoaded = () => {
      loaded++;
      if (loaded === total) setLoading(false);
    };

    const unsubEventos = eventosService.subscribe((data) => {
      setEventos(data);
      markLoaded();
    });

    const unsubTarefas = tarefasService.subscribe((data) => {
      setTarefas(data);
      markLoaded();
    });

    const unsubNecessidades = necessidadesService.subscribe((data) => {
      setNecessidades(data);
      markLoaded();
    });


    return () => {
      unsubEventos();
      unsubTarefas();
      unsubNecessidades();
    };

  }, []);

  const { user } = useAuth();
  const { showEventos, showTarefas } = useCalendarioEngine();
  if (!user) return <NoUser />;

  const { hortaId } = useParams();
  const { modo } = useCalendarioEngine();

  const ViewComponent = VIEW_COMPONENTS[modo] || CalendarioMes;

  return (
    <div>
      <ViewComponent
        tarefas={showTarefas ? tarefas : []}
        eventos={showEventos ? eventos : []}
        necessidades={necessidades}
        hortaId={hortaId}
      />
    </div>
  );
}