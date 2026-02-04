export function useMapTransform({
  view,
  rotate,
  bbox,
  getSVGPoint
}) {

  const rotatePoint = (p, angleDeg, cx, cy) => {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const dx = p.x - cx;
    const dy = p.y - cy;

    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  };

  const getMapPoint = (p, view, mapWorld) => {
    // 1) tira pan + zoom (camera)
    const unscaled = {
      x: (p.x - view.x) / view.scale,
      y: (p.y - view.y) / view.scale,
    };

    // 2) tira offset do mundo
    const local = {
      x: unscaled.x - mapWorld.offsetX,
      y: unscaled.y - mapWorld.offsetY,
    };

    // 3) desfaz rotação no centro real
    return rotatePoint(
      local,
      -view.rotate,
      view.bbox.cX,
      view.bbox.cY
    );
  };

  return {
    getMapPoint
  };
}

export const getBoundingBox = (vertices) => {
    const xs = vertices.map(v => v.x);
    const ys = vertices.map(v => v.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };
  };

export const pointInPolygon = (point, polygon) => {
    let inside = false;
  
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
  
      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
  
      if (intersect) inside = !inside;
    }
  
    return inside;
  };

export  const rotatePoint = (p, angleDeg, cx, cy) => {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const dx = p.x - cx;
    const dy = p.y - cy;

    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  };

export const getEventSVGPoint = (evt) => {
    const svg = evt.currentTarget.ownerSVGElement || evt.currentTarget;
    if (!svg?.createSVGPoint) return null;

    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;

    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };


export const getMapPointFromPoint = (p, view, mapWorld) => {
  const unscaled = {
    x: (p.x - view.x) / view.scale,
    y: (p.y - view.y) / view.scale,
  };

  const local = {
    x: unscaled.x - mapWorld.offsetX,
    y: unscaled.y - mapWorld.offsetY,
  };

  return rotatePoint(
    local,
    -view.rotate,
    view.bbox.cX,
    view.bbox.cY
  );
};
