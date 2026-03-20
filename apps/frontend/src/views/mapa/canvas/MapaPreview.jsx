import { useMemo } from "react";
import { useMapaEngine } from "../MapaEngine";
import { getMouseInMapSpace } from "../../../utils/coordinatesUtils";
import { usePointer } from "../../../hooks/usePointer";
import SVGEntidade from "../../../services/svg/SVGEntidade";
import { useEffect } from "react";

export default function MapaPreview ({ svgRef, gRef }) {
  const cursor = usePointer(svgRef);
  const { previewSetup } = useMapaEngine();
  if (!cursor) return null;
  if (!previewSetup || !previewSetup.active) return null;

  
    // Calcula o preview
    const cursorMap = getMouseInMapSpace(
      svgRef.current,
      gRef.current,
      cursor.x,
      cursor.y
    );
    if (!cursorMap) return;

  
    // Calcula o ponto inicial
    const start = {
      x: cursorMap.x,
      y: cursorMap.y,
    }

    const pontos = useMemo(() => {
    return getPreviewPoints({
      start,
      geometria: previewSetup.entidade.aparencia.geometria,
      layout: previewSetup.layout,
    })
  }, [
    cursor.x,
    cursor.y,
    previewSetup.entidade,
    previewSetup.layout,
  ]);

  return (
    <>
    {pontos.map((pos, idx)=>
      <SVGEntidade
        key={`preview-${idx}`}
        entidade = {previewSetup.entidade}
        pos = {pos}
        dim = {previewSetup.layout.dimensao}
      />
    )}
    </>
  )
}

const getPreviewPoints = ({ start, geometria, layout}) => {
  if (!geometria || !start || !layout) return [];

  const offsetX = layout.espacamentoColuna
  const offsetY = layout.espacamentoLinha
  
  const result = [];
  for (let l = 0; l < layout.linhas; l++) {
    for (let c = 0; c < layout.colunas; c++) {
      result.push({
        x: start.x + (c * offsetX),
        y: start.y + (l * offsetY),
      });
    }
  }
  return result;
}