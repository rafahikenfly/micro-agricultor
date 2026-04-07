import { useMemo } from "react";
import { useCalendarioEngine } from "../CalendarioEngine";
import CalendarioEvento from "../canvas/CalendarioEvento";
import CalendarioTarefa from "../canvas/CalendarioTarefa";
import { gerarMes } from "./gerador";
import { mesmaData } from "../../../utils/dateUtils";

export default function CalendarioMes({
  eventos = [],
  tarefas = [],
  necessidades = [],
}) {
  const { inicio } = useCalendarioEngine();

  const dias = useMemo(() => {
    if (!inicio) return [];
    return gerarMes(inicio);
  }, [inicio]);

  const nomeMes = inicio.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="cal-mes-header">
        {nomeMes}
      </div>
      <div className="cal-mes-grid">
        {dias.map((dia, index) => {
          const eventosDia = eventos.filter(e => mesmaData(e.timestamp, dia));
          const tarefasDia = tarefas.filter(t => mesmaData(t.planejamento.vencimento, dia));
          const isMesAtual = dia.getMonth() === inicio.getMonth();

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
    </div>
  );
}