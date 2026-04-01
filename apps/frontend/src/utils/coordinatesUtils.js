import { GEOMETRY_TYPES } from "micro-agricultor";
import { circleFromEntity, moveCircle, moveRect, rectFromEntity, resizeCircleBox, resizeCircleRadius, resizeRect, viewFromCircle, viewFromRect } from "./geometryUtils";

export const getMouseInMapSpace = (svg, g, clientX, clientY) => {
  const svgPoint = getSVGPoint(svg, clientX, clientY)
  const mapPoint = svgPoint.matrixTransform(g.getCTM().inverse());
  return mapPoint;
};

export const getSVGPoint = (svg, clientX, clientY) => {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

export const pointNearBorder = (p, entidade, tolerance = 8) => {
  const { posicao, dimensao, aparencia } = entidade;
  const geometria = aparencia?.geometria;

  if (!geometria || geometria === "polygon") return false;

  // CIRCLE
  if (geometria === "circle") {
    const dx = p.x - posicao.x;
    const dy = p.y - posicao.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.max(dimensao.x,dimensao.y) / 2;

    const nearEdge = Math.abs(distance - radius) <= tolerance;

    let angle = Math.atan2(dy, dx)
    if (angle < 0) angle += 2 * Math.PI;

    const sectorSize = Math.PI / 4; // 45°
    const sector = Math.round(angle / sectorSize) % 8;

    const handles = [
      "e",  // 0
      "se", // π/4
      "s",  // π/2
      "sw", // 3π/4
      "w",  // π
      "nw", // 5π/4
      "n",  // 3π/2
      "ne"  // 7π/4
    ];

    return nearEdge ? handles[sector] : false;
  }

  // RECT / ELLIPSE

  const halfW = dimensao.x / 2;
  const halfH = dimensao.y / 2;

  const left   = posicao.x - halfW;
  const right  = posicao.x + halfW;
  const top    = posicao.y - halfH;
  const bottom = posicao.y + halfH;

  const nearLeft   = Math.abs(p.x - left)   <= tolerance;
  const nearRight  = Math.abs(p.x - right)  <= tolerance;
  const nearTop    = Math.abs(p.y - top)    <= tolerance;
  const nearBottom = Math.abs(p.y - bottom) <= tolerance;

  const insideX = p.x > left && p.x < right;
  const insideY = p.y > top  && p.y < bottom;

  // Cantos primeiro (prioridade)
  if (nearLeft && nearTop) return "nw";
  if (nearRight && nearTop) return "ne";
  if (nearLeft && nearBottom) return "sw";
  if (nearRight && nearBottom) return "se";

  // Bordas
  if (nearLeft && insideY) return "w";
  if (nearRight && insideY) return "e";
  if (nearTop && insideX) return "n";
  if (nearBottom && insideX) return "s";

  return false;
}

export function pointInBounds(point, bounds) {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
}
function rectInBounds(rect, bounds) {
  const inner = {
    minX: rect.posicao.x - rect.dimensao.x/2,
    maxX: rect.posicao.x + rect.dimensao.x/2,
    minY: rect.posicao.y - rect.dimensao.y/2,
    maxY: rect.posicao.y + rect.dimensao.y/2,
  }  
  return (
    inner.minX >= bounds.minX &&
    inner.maxX <= bounds.maxX &&
    inner.minY >= bounds.minY &&
    inner.maxY <= bounds.maxY
  );
}
function polygonInBounds(vertices, bounds) {
  return vertices.every(v =>
    v.x >= bounds.minX &&
    v.x <= bounds.maxX &&
    v.y >= bounds.minY &&
    v.y <= bounds.maxY
  );
}

export function entitiesInBounds(entidades, bounds) {
  return entidades.filter((ent) => {
    if (ent.aparencia.geometria === GEOMETRY_TYPES.RECT) return rectInBounds(ent, bounds)
    if (ent.aparencia.geometria === GEOMETRY_TYPES.POLYGON) return polygonInBounds(ent.aparencia.vertices, bounds)
    if (ent.aparencia.geometria === GEOMETRY_TYPES.CIRCLE) return rectInBounds(ent,bounds)
    return pointInBounds(ent.posicao, bounds)}
  );
}

export function resolveDrawRectPreview(startMap, currentMap) {

  const dx = currentMap.x - startMap.x;
  const dy = currentMap.y - startMap.y;

  return {
    x: Math.min(startMap.x, currentMap.x),
    y: Math.min(startMap.y, currentMap.y),
    width: Math.abs(dx),
    height: Math.abs(dy)
  };
}
export function resolveDrawCirclePreview(startMap, currentMap) {

  const dx = currentMap.x - startMap.x;
  const dy = currentMap.y - startMap.y;

  const r = Math.sqrt(dx * dx + dy * dy);

  return {
    cx: startMap.x,
    cy: startMap.y,
    r
  };
}

// PREVIEW UTILS
export const getPreviewPoints = ({ start, geometria, layout }) => {
  if (!geometria || !start || !layout) return [];

  function getColumnLabel(n) {
    let label = "";

    while (n >= 0) {
      label = String.fromCharCode((n % 26) + 65) + label;
      n = Math.floor(n / 26) - 1;
    }

    return label;
  }  
  const offsetX = layout.espacamentoColuna;
  const offsetY = layout.espacamentoLinha;
  
  const result = [];
  for (let l = 0; l < layout.linhas; l++) {
    for (let c = 0; c < layout.colunas; c++) {
      const letra = getColumnLabel(c);
      result.push({
        x: start.x + (c * offsetX),
        y: start.y + (l * offsetY),
        linha: l + 1,
        coluna: c + 1,
        coordenada: `${letra}${l + 1}`
      });
    }
  }
  return result;
};

//RECT PREVIEW
export function resolveResizeRectPreview(startMap, currentMap, direction, entity) {
  const rect = rectFromEntity(entity);
  const resized = resizeRect({rect, direction, currentMap});

  return viewFromRect(resized);
}
export function resolveMoveRectPreview(startMap, currentMap, entity) {
  const rect = rectFromEntity(entity);
  const moved = moveRect({rect, startMap, currentMap});
  return viewFromRect(moved);
}

//CIRCLE PREVIEW
export function resolveMoveCirclePreview(startMap, currentMap, entity) {
  const circle = circleFromEntity(entity);
  const moved = moveCircle({ circle, startMap, currentMap });
  return viewFromCircle(moved);
}
export function resolveResizeCirclePreview(startMap, currentMap, direction, entity) {
  const circle = circleFromEntity(entity);
  const resized = resizeCircleRadius({ circle, currentMap });
  return viewFromCircle(resized);
}

//ELLIPSE PREVIEW

//POLYGON PREVIEW