import { useMemo } from "react";
import { useCalendarioEngine } from "../CalendarioEngine";
import { gerarDia, gerarHorarios } from "./gerador";
import { mesmaData } from "../../../utils/dateUtils";
import CalendarioTarefa from "../canvas/CalendarioTarefa";
import CalendarioEvento from "../canvas/CalendarioEvento";

export default function CalendarioDia({
  eventos = [],
  tarefas = [],
  necessidades = [],
}) {
  const { inicio } = useCalendarioEngine();

  const dias = useMemo(() => {
    if (!inicio) return [];
    return [gerarDia(inicio)];
  }, [inicio]);

  return (
    <div className="cal-dia-grid">
      {dias.map((dia, index) => {
        const blocos = gerarHorarios(dia);
        const isHoje = mesmaData(new Date(), dia);

        return (
          <div
            key={index}
            className={`cal-dia ${isHoje ? "hoje" : ""}`}
          >
            <div className="cal-dia-header">
              {dia.toLocaleDateString()}
            </div>

            <div className="cal-dia-body">
              {blocos.map((bloco, i) => {

                const eventosBloco = eventos.filter(e => {
                  const data = new Date(e.timestamp);
                  return data >= bloco.inicio && data < bloco.fim;
                });

                const tarefasBloco = tarefas.filter(t => {
                  const data = new Date(t.planejamento.vencimento);
                  return data >= bloco.inicio && data < bloco.fim;
                });

                return (
                  <div key={i} className="cal-bloco">
                    <div className="cal-bloco-header">
                      {bloco.label}
                    </div>

                    <div className="cal-bloco-body">
                      {eventosBloco.map(e => (
                        <CalendarioEvento
                          key={`e-${e.id}`}
                          evento={e}
                        />
                      ))}

                      {tarefasBloco.map(t => (
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
      })}
    </div>
  );
}