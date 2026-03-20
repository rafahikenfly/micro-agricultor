import { useMemo } from "react";
import { useCalendarioEngine } from "../CalendarioEngine";
import CalendarioEvento from "../ui/CalendarioEvento";
import CalendarioTarefa from "../ui/CalendarioTarefa";
import { gerarGradeMes } from "../utils/geradorDias";
import { mesmaData } from "../utils/mesmaData";

export default function CalendarioGridMes({
  eventos = [],
  tarefas = [],
  necessidades = [],
}) {
  const { intervalo, } = useCalendarioEngine();

  const dias = useMemo(() => {
    if (!intervalo.inicio) return [];
    return gerarGradeMes(intervalo.inicio);
  }, [intervalo]);

  /*const itensFiltrados = useMemo(() => {
    return {
      eventos: eventos.filter(e =>
        (!hortasSelecionadas.length ||
          hortasSelecionadas.includes(e.hortaId)) &&
        (!filtros.categoriasEvento.length ||
          filtros.categoriasEvento.includes(e.categoria))
      ),
      tarefas: tarefas.filter(t =>
        (!hortasSelecionadas.length ||
          hortasSelecionadas.includes(t.hortaId)) &&
        (!filtros.statusTarefa.length ||
          filtros.statusTarefa.includes(t.estado))
      ),
    };
  }, [eventos, tarefas, hortasSelecionadas, filtros]);*/

  return (
    <div className="cal-mes-grid">
      {dias.map((dia, index) => {
        const eventosDia = eventos.filter(e =>
          mesmaData(e.timestamp, dia)
        );

        const tarefasDia = tarefas.filter(t =>
          mesmaData(t.planejamento.vencimento, dia)
        );

        const isMesAtual =
          dia.getMonth() === intervalo.inicio.getMonth();

        return (
          <div
            key={index}
            className={`cal-dia ${isMesAtual ? "" : "out"}`}
          >
            <div className="cal-dia-header">
              {dia.getDate()}
            </div>

            <div className="cal-dia-body">
              {eventosDia.map(e => (
                <CalendarioEvento
                  key={`e-${e.id}`}
                  evento={e}
                />
              ))}

              {tarefasDia.map(t => (
                <CalendarioTarefa
                  key={`t-${t.id}`}
                  tarefa={t}
                  necessidades={necessidades.filter((n)=>n.vinculo?.id === t.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}