import { useState } from "react";
import { useCatalogos } from "../hooks/useCatalogos";
import { MediaGrid } from "./galeria/MediaGrid";
import { MidiaTimeline } from "./galeria/MediaTimeline";
import { MediaToolbar } from "./galeria/MediaToolbar";

export default function Galeria({ entidadeId }) {
  const { catalogoMidias, reading } = useCatalogos(["midias"]);

  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("timeline");

  const midias = (catalogoMidias?.list ?? []).filter((a)=>a.contexto.entidadeId === entidadeId)
  return (
    <div className="media-tab">
      <MediaToolbar
        onChange={(a)=>setMode(a.mode)}
        defaultMode="grid"
      />

      {mode === "grid" ? (
        <MediaGrid midias={midias} onSelect={setSelected} />
      ) : (
        <MidiaTimeline midias={midias} onSelect={setSelected} />
      )}

      {selected && (
        <MediaPreview
          media={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}