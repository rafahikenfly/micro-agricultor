import { useState } from "react";
import { useCache } from "../hooks/useCache";
import Loading from "./Loading";
import { EventoPreview } from "./eventos/EventoPreview";
import { EventoTimeline } from "./eventos/EventoTimeline";
import { EventoToolbar } from "./eventos/EventoToolbar";

export default function Eventos({ entidadeId, tipoEntidadeId }) {
  const { cacheEventos, reading } = useCache(["eventos"]);

  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState({
    timeRange: "DIA",
    timeRangeValue: 86400000,
    busca: "",
    tipo: null,
  });

  const entidadeKey = `${tipoEntidadeId}:${entidadeId}`;

  const eventos = (cacheEventos?.list ?? [])
    .filter((e) => e.entidadesKey?.includes(entidadeKey))
    .filter((e) => e.timestamp > Date.now() - options.timeRangeValue)
    .filter((e) => !options.tipoEventoId || e.tipoEventoId === options.tipoEvento)
    .filter((e) => !options.tipoEvento || e.tipoEventoId === options.tipoEvento)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (reading) return <Loading />;

  return (
    <div className="historico-tab">
      <EventoToolbar
        onChange={(option)=>setOptions({...options, ...option})}
        options={options}
      />
      
    <div className="d-flex gap-3">
      {/* LISTA */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <EventoTimeline eventos={eventos} onSelect={(a)=>setSelected(selected ? null : a)} />
      </div>
      {/* PREVIEW */}
      {selected && <div
        style={{
            width: 350,
            borderLeft: "1px solid #ddd",
            paddingLeft: 12,
        }}
      >
        <EventoPreview
            evento={selected}
            onClose={() => setSelected(null)}
        />
        </div>}
    </div>
    </div>
  );
}