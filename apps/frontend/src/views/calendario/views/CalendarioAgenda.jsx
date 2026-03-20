import { useMemo } from "react";
import { useCalendarioEngine } from "../CalendarioEngine";
import { unixToReadableString } from "../../../utils/dateUtils";
import { gerarListaDias, } from "../utils/geradorDias";
import CalendarioTarefa from "../ui/CalendarioTarefa";
import { mesmaData } from "../utils/mesmaData";
import { JOBSTATE_TYPES } from "@shared/types/JOBRUN_STATE";
import CalendarioEvento from "../ui/CalendarioEvento";

function startOfDay(unix) {
  const d = new Date(unix);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default function CalendarioAgenda({eventos, tarefas, necessidades}) {
  const engine = useCalendarioEngine();

  const { inicio, tamanho } = engine.intervalo;
  const fimMap = {
    dia: 1,
    semana: 7,
    mes: 30
  }

  const listaDias = useMemo(() => {
    return gerarListaDias(inicio,inicio + fimMap[tamanho])
  }, [inicio, tamanho]);

  const tarefasAtrasadas = useMemo(() => {
    return tarefas
      .filter(t =>
        t.estado !== JOBSTATE_TYPES.DONE &&
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

        
    if (mesmaData(dataRef, inicio) && dataRef <= inicio + fimMap[tamanho]) {
        const dia = startOfDay(dataRef);
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

      {tarefasAtrasadas.length > 0 && (
        <div className="cal-dia-bloco atrasadas">
          <div className="cal-dia-header">
            Atrasadas
          </div>
          {tarefasAtrasadas.map(tarefa => (
            <CalendarioTarefa
              key={`atrasada-${tarefa.id}`}
              tarefa={tarefa}
              necessidades={necessidades.filter((n)=>n.vinculo?.id === tarefa.id)}
            />
          ))}
        </div>
      )}

      {(listaDias ?? []).map(dia => (
        <div key={dia} className="cal-dia-bloco">
          <div className="cal-dia-header">
            {unixToReadableString(dia)}
          </div>

          {(agendaDoDia[dia] || []).length === 0 && (
            <div className="cal-dia-vazio">
              Nenhum item
            </div>
          )}
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