import { useState } from "react";
import { useCache } from "../hooks/useCache";
import Loading from "./Loading";

import { TarefaPreview } from "./tarefas/TarefaPreview";
import { TarefaTimeline } from "./tarefas/TarefaTimeline";
import { TarefaToolbar } from "./tarefas/TarefaToolbar";

export default function Tarefas({ entidadeId, tipoEntidadeId }) {
  const { cacheTarefas, reading } = useCache(["tarefas"]);

  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState({
    timeRange: "DIA",
    timeRangeValue: 86400000,
    busca: "",
    status: null,
  });

  const tarefas = (cacheTarefas?.list ?? [])
    .filter((t) => t.contexto.entidadesId.includes(entidadeId))
    .filter((t) => t.planejamento.vencimento > Date.now() - options.timeRangeValue)
    .filter((t) => !options.estado || t.estado === options.estado)
//  .filter((t) => !options.recorrente || t.planejamento.recorrencia === options.recorrente)
//    .filter((t) => !options.resolvida || options.resolvida === !!t.resolucao)
//    .filter((t) =>
//      !options.busca ||
//      t.nome?.toLowerCase().includes(options.busca.toLowerCase())
//    )
    .sort((a, b) => b.timestamp - a.timestamp);

  if (reading) return <Loading />;
  return (
    <div className="tarefas-tab">
      <TarefaToolbar
        onChange={(option) => setOptions({ ...options, ...option })}
        options={options}
      />

      <div className="d-flex gap-3">
        {/* LISTA */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <TarefaTimeline
            tarefas={tarefas}
            onSelect={(t) => setSelected(selected ? null : t)}
          />
        </div>

        {/* PREVIEW */}
        {selected && (
          <div
            style={{
              width: 350,
              borderLeft: "1px solid #ddd",
              paddingLeft: 12,
            }}
          >
            <TarefaPreview
              tarefa={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}