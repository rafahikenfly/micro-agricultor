import { GEOMETRY_TYPES } from "micro-agricultor";
import { getMouseInMapSpace, resolveDrawCirclePreview, resolveDrawRectPreview, resolveMoveCirclePreview, resolveMoveRectPreview, resolveResizeCirclePreview, resolveResizeRectPreview } from "../../../utils/coordinatesUtils";
import { useMapaEngine } from "../MapaEngine";

export default function MapaDrag({svgRef, gRef, drag}) {
  // Recupera o setup da ação
  const { dragSetup} = useMapaEngine();

  // Calcula o preview
  const geometria = dragSetup.geometry;
  const startMap = getMouseInMapSpace(
    svgRef.current,
    gRef.current,
    drag.start.x,
    drag.start.y);
  const currentMap = getMouseInMapSpace(
    svgRef.current,
    gRef.current,
    drag.current.x,
    drag.current.y
  );

  // eu tenho duas variáveis aqui:
  // - tipo de geometria (rect, circle, ellipse, polygon)
  // - tipo de drag (draw, resize, move)
  // - ainda é gerenciavel com 12 condições, mas tende a virar um inferno
  //TODO: RESOLVER OUTRAS GEOMETRIAS (CIRCLE, ELLIPSE E POLYGON)
  function resolveDragPreview(drag, startMap, currentMap) {
    switch (drag.type) {
      case "desenhar":
      case "selecionar":
      case "generic":
        if (geometria === GEOMETRY_TYPES.RECT)   return resolveDrawRectPreview(startMap, currentMap);
        if (geometria === GEOMETRY_TYPES.CIRCLE) return resolveDrawCirclePreview(startMap, currentMap);
        console.warn(`Geometria ${geometria} não implementada para drag ${drag.type}.`)
        break;
      case "redimensionar":
        if (geometria === GEOMETRY_TYPES.RECT)   return resolveResizeRectPreview(startMap, currentMap, drag.direction, drag.entidade);
        if (geometria === GEOMETRY_TYPES.CIRCLE) return resolveResizeCirclePreview(startMap, currentMap, drag.direction, drag.entidade);
        console.warn(`Geometria ${geometria} não implementada para drag ${drag.type}.`)
        break;
      case "mover":
        if (geometria === GEOMETRY_TYPES.RECT) return resolveMoveRectPreview(startMap, currentMap, drag.entidade);
        if (geometria === GEOMETRY_TYPES.CIRCLE)return resolveMoveCirclePreview(startMap, currentMap, drag.entidade);
        console.warn(`Geometria ${geometria} não implementada para drag ${drag.type}.`)
        break;
      default:
        console.warn(`Drag ${drag.type} não implementado.`)
        return null;
    }

  }
  const previewCoordinates = resolveDragPreview(drag, startMap, currentMap)

  // Evita render inútil
  if (!previewCoordinates) return null
  if (previewCoordinates.width === 0 || previewCoordinates.height === 0) return null;

  switch (geometria) {
    case "rect":
      return (
        <rect
          {...previewCoordinates}
          {...dragSetup.preview}
        />
      );

    case "circle": {
      return (
        <circle
          {...previewCoordinates}
          {...dragSetup.preview}
        />
      );
    }

    case "ellipse":
      return (
        <ellipse
          cx={x + width / 2}
          cy={y + height / 2}
          rx={width / 2}
          ry={height / 2}
          {...dragSetup.preview}
        />
      );

    default:
      console.warn(`${geometria} não disponível em MapaDrag`)
      return null;
  }
}
