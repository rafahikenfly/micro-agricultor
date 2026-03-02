import { useMemo } from "react";
import { SVGPreview } from "../../../services/svg/SVGPreview";
import { useMapaEngine } from "../MapaEngine";
import { getPreviewPoints } from "../../../services/svg/PointFunctions";

export default function MapaPreview () {
  const engine = useMapaEngine();
  const { mousePos, placing, preview } = engine.state;
  const { linhas, colunas, espacamentoLinha, espacamentoColuna } = placing.layout;
  
  // calcula os pontos sempre
   const pontos = useMemo(() => {
    return getPreviewPoints({
      mousePos,
      preview,
      linhas,
      colunas,
      espacamentoLinha,
      espacamentoColuna
    })
/*    if (!mousePos) return [];
    if (preview.geometria === "ellipse") {console.warn ("preview ellipse não implementado"); return []}
    if (preview.geometria === "polygon") {console.warn ("preview poligon não implementado"); return []}

    const offsetX =
    preview.geometria === "circle"
      ? preview.width / 2
      : preview.width;

    const offsetY =
      preview.geometria === "circle"
        ? preview.height / 2
        : preview.height;

    const startX =
      mousePos.x
      - offsetX
      - (colunas - 1) * espacamentoColuna;
    const startY =
      mousePos.y
      - offsetY
      - (linhas - 1) * espacamentoLinha;

      const result = [];
    
    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        const mapPoint = {
          x: startX + c * espacamentoColuna,
          y: startY + l * espacamentoLinha,
        };

        result.push(mapPoint);
      }
    } 
    return result;*/
  }, [
    mousePos?.x,
    mousePos?.y,
    linhas,
    colunas,
    espacamentoLinha,
    espacamentoColuna,
  ]);

//  useEffect(() => {
//    if (!mousePos) return;
//    engine.setPreviewPoints(pontos);
//  }, [pontos, mousePos]);

  if (!mousePos) return null;
  return (
    <SVGPreview 
      pontos={pontos}
      geometria={preview.geometria}
      style={{
        radius: preview.radius,
        width: preview.width,
        height: preview.height,
      }}
    />
  )
}