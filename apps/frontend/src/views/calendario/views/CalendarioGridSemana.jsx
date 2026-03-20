import { useMemo } from "react";
import { useCalendarioEngine } from "../CalendarioEngine";
import CalendarioEvento from "../ui/CalendarioEvento";
import CalendarioTarefa from "../ui/CalendarioTarefa";
import { mesmaData } from "../utils/mesmaData";
import { gerarSemana } from "../utils/geradorDias";

export default function CalendarioGridSemana({
  eventos = [],
  tarefas = [],
  necessidades = [],
}) {
  const { intervalo, } =
    useCalendarioEngine();

  const dias = useMemo(() => {
    if (!intervalo.inicio) return [];
    return gerarSemana(intervalo.inicio);
  }, [intervalo]);

  return (
    <div className="cal-semana-grid">
      {dias.map((dia, index) => {

        const eventosDia = eventos.filter(e =>
          mesmaData(e.timestamp, dia)
        );

        const tarefasDia = tarefas.filter(t =>
          mesmaData(t.planejamento.vencimento, dia)
        );

        const isHoje =
          mesmaData(new Date(), dia);

        return (
          <div
            key={index}
            className={`cal-dia ${isHoje ? "hoje" : ""}`}
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