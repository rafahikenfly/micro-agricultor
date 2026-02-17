import { useEffect } from "react";
import { getMapPointFromPoint } from "../../../services/svg/PointFunctions";
import { SVGPreview } from "../../../services/svg/SVGPreview";
import { useMapaEngine } from "../MapaEngine";

export default function MapaPreview () {
  const engine = useMapaEngine();
  const { mousePos, transform, actionConfig } = engine.state;
  if (!actionConfig?.preview?.show) return null;
  if (!mousePos) return null;

  const { linhas, colunas, espacamentoLinha, espacamentoColuna } =
    actionConfig.layout;

  const pontos = [];
  // ponto inicial do grid (SVG Coord)
  const startX = mousePos.x - ((actionConfig.preview.radius || actionConfig.preview.width) * transform.scale);
  const startY = mousePos.y - ((actionConfig.preview.radius || actionConfig.preview.height) * transform.scale);

  // monta o grid
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      const svgPoint = {
        x: startX - c * (espacamentoColuna * transform.scale),
        y: startY - l * (espacamentoLinha * transform.scale),
      };
      const mapPoint = getMapPointFromPoint(svgPoint, transform);
      pontos.push(mapPoint);
    }
  }

  useEffect(() => {
    engine.setPreviewPoints(pontos);
  }, [
    mousePos?.x,
    mousePos?.y,
    transform.x,
    transform.y,
    transform.scale,
    transform.rotate,
    linhas,
    colunas,
    espacamentoLinha,
    espacamentoColuna
  ]);

  return (
    <SVGPreview 
      pontos={pontos}
      geometria={actionConfig.preview.geometria}
      style={{
        radius: actionConfig.preview.radius,
        width: actionConfig.preview.width,
        height: actionConfig.preview.height,
      }}
    />
  )
}