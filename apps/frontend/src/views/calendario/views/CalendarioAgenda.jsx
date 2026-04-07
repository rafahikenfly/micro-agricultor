import { useMemo } from "react";
import { useCalendarioEngine } from "../CalendarioEngine";
import { inicioDoDia, unixToReadableString } from "../../../utils/dateUtils";
import CalendarioTarefa from "../canvas/CalendarioTarefa";
import CalendarioEvento from "../canvas/CalendarioEvento";
import { ESTADO_TAREFA } from "micro-agricultor";

export default function CalendarioAgenda({eventos, tarefas, necessidades}) {
  const { inicio } = useCalendarioEngine();

  let tamanho = 10;
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + tamanho)

  const listaDias = useMemo(() => {
    return gerarListaDias(inicio, fim)
  }, [inicio]);

  const tarefasAnteriores = useMemo(() => {
    return tarefas
      .filter(t =>
        t.estado !== ESTADO_TAREFA.FEITO.id &&
        t.planejamento?.vencimento < inicio
      )
      .sort((a, b) =>
        a.planejamento.vencimento - b.planejamento.vencimento
      );
  }, [tarefas, inicio]);

  const agendaDoDia = useMemo(() => {
    const agenda = {};

    listaDias.forEach(d => {
      agenda[d] = [];
    });

    const todosItens = [
      ...(eventos || []),
      ...(tarefas || [])
    ];

    todosItens.forEach(item => {
      const dataRef =
        item.resolucao?.data ||             //tarefa, prioridade na resolucao
        item.planejamento?.vencimento ||    //tarefa, sem resolucao
        item.timestamp;                     //evento, timestamp

        
    if (dataRef >= inicio && dataRef <= fim) {
        const dia = inicioDoDia(dataRef);
        if (!agenda[dia]) agenda[dia] = [];
        agenda[dia].push(item);
      }
    });

    Object.values(agenda).forEach(lista =>
      lista.sort((a, b) => {
        const da =
          a.resolucao?.data || a.planejamento?.vencimento || a.timestamp;
        const db =
          b.resolucao?.data || b.planejamento?.vencimento || b.timestamp;
        return da - db;
      })
    );

    return agenda;
  }, [eventos, tarefas, listaDias, inicio, tamanho]);

  return (
    <div className="cal-agenda">

      {tarefasAnteriores.length > 0 && (
        <div className="cal-dia-bloco atrasadas">
          <div className="cal-dia-header">
            {tarefasAnteriores.length} Tarefas anteriores
          </div>
        </div>
      )}

      {(listaDias ?? []).map(dia => (
        <div key={dia} className="cal-dia-bloco">
          <div className="cal-dia-header">
            {unixToReadableString(dia)}
          </div>
            {(agendaDoDia[dia] || []).map(item => {
              const isTarefa = !!item.estado;

              return isTarefa ? (
                <CalendarioTarefa
                  key={`tarefa-${item.id}`}
                  tarefa={item}
                  necessidades={necessidades.filter((n)=>n.vinculo?.id === item.id)}
                />
              ) : (
                <CalendarioEvento
                  key={`evento-${item.id}`}
                  evento={item}
                />
              );
            })}
        </div>
      ))}

    </div>
  );
}