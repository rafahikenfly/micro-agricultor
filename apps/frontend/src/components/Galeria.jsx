import { useState } from "react";
import { useCache } from "../hooks/useCache";
import { MediaGrid } from "./galeria/MediaGrid";
import { MidiaTimeline } from "./galeria/MediaTimeline";
import { MediaToolbar } from "./galeria/MediaToolbar";
import { MediaPreview } from "./galeria/MediaPreview";
import Loading from "./Loading";

export default function Galeria({ entidadeId }) {
  const { cacheMidias, reading } = useCache(["midias"]);

  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState({
    mode: "timeline",
    timeRange: "DIA",
    timeRangeValue: 86400000,
    tipo: "CAPTURA",
    anotada: false,
    busca: "",
  });

  const midias = (cacheMidias?.list ?? [])
    .filter((a)=>a.contexto.entidadeId === entidadeId)
    .filter((a)=>a.contexto.timestamp > Date.now() - options.timeRangeValue)
    .filter((a)=>a.metadados.anotada === options.anotada)
    .filter((a)=>!options.busca || a.descricao.toLowerCase().includes(options.busca.toLowerCase()))

  if (reading) return <Loading />;
  return (
    <div className="media-tab">
      <MediaToolbar
        onChange={(option)=>setOptions({...options, ...option})}
        options={options}
      />

      {selected ?
        <MediaPreview
          media={selected}
          onClose={()=>setSelected(null)}
        />
      : options === "grid" ? (
        <MediaGrid midias={midias} onSelect={setSelected} />
      ) : (
        <MidiaTimeline midias={midias} onSelect={setSelected} />
      )}
    </div>
  );
}