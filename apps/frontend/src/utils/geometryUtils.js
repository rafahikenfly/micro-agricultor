export function calcularArea(entidade) {
  if (!entidade.dimensao) entidade.dimensao={};
  if (!entidade.aparencia.geometria) return 0;

  const { y, x } = entidade.dimensao;

  switch (entidade.aparencia.geometria) {
    case "rect":
      return x * y;
    case "circle": {
      const diametro = Math.min(x, y);
      const raio = diametro / 2;
      return Math.PI * raio ** 2;
    }
    case "ellipse": {
      const a = x / 2;
      const b = y / 2;
      return Math.PI * a * b;
    }
    case "polygon": {
      const pontos = entidade.aparencia.vertices;

      if (!pontos || pontos.length < 3) return 0;

      let area = 0;
      const n = pontos.length;

      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += pontos[i].x * pontos[j].y;
        area -= pontos[j].x * pontos[i].y;
      }

      return Math.abs(area) / 2;
    }

    default:
      console.warn(`Não é possível calcular área de ${entidade.aparencia.geometria}`)
      return 0;
  }
}

export function rectFromPoints(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  return {
    x: Math.min(p1.x, p2.x),
    y: Math.min(p1.y, p2.y),
    width: Math.abs(dx),
    height: Math.abs(dy)
  };
}

export function circleFromCenter(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  return {
    cx: p1.x,
    cy: p1.y,
    r: Math.sqrt(dx * dx + dy * dy)
  };
}

// RECT
export function rectFromEntity(entity) {
  return {
    cx: entity.posicao.x,
    cy: entity.posicao.y,
    w: entity.dimensao.x,
    h: entity.dimensao.y
  };
}
export function entityFromRect(rect, entity) {
  return {
    ...entity,
    posicao: {
      ...entity.posicao,
      x: rect.cx,
      y: rect.cy
    },
    dimensao: {
      x: rect.w,
      y: rect.h
    }
  };
}
export function viewFromRect(rect) {
  return {
    x: rect.cx - rect.w / 2,
    y: rect.cy - rect.h / 2,
    width: rect.w,
    height: rect.h
  };
}
export function resizeRect({ rect, direction, currentMap }) {
  const { cx, cy, w, h } = rect;
  
  const halfW = w / 2;
  const halfH = h / 2;

  let left   = cx - halfW;
  let right  = cx + halfW;
  let top    = cy - halfH;
  let bottom = cy + halfH;

  if (direction.includes("n")) top = currentMap.y;
  if (direction.includes("s")) bottom = currentMap.y;
  if (direction.includes("w")) left = currentMap.x;
  if (direction.includes("e")) right = currentMap.x;

  const newW = Math.abs(right - left);
  const newH = Math.abs(bottom - top);
  const newCx = left + newW / 2;
  const newCy = top + newH / 2;

  return {
    cx: newCx,
    cy: newCy,
    w: newW,
    h: newH
  };
}
export function moveRect({ rect, startMap, currentMap }) {

  const dx = currentMap.x - startMap.x;
  const dy = currentMap.y - startMap.y;

  return {
    cx: rect.cx + dx,
    cy: rect.cy + dy,
    w: rect.w,
    h: rect.h
  };
}

// CIRCLE
export function circleFromEntity(entity) {
  return {
    cx: entity.posicao.x,
    cy: entity.posicao.y,
    r: entity.dimensao.x / 2
  };
}
export function entityFromCircle(circle, entity) {
  const diameter = circle.r * 2;

  return {
    ...entity,
    posicao: {
      ...entity.posicao,
      x: circle.cx,
      y: circle.cy
    },
    dimensao: {
      x: diameter,
      y: diameter
    }
  };
}
export function viewFromCircle(circle) {
  const diameter = circle.r * 2;

  return {
    cx: circle.cx,
    cy: circle.cy,
    r: circle.r,
  };
}
export function resizeCircleRadius({ circle, currentMap }) {
  const dx = currentMap.x - circle.cx;
  const dy = currentMap.y - circle.cy;

  const r = Math.sqrt(dx * dx + dy * dy);

  return {
    cx: circle.cx,
    cy: circle.cy,
    r
  };
}
export function resizeCircleBox({ circle, direction, currentMap }) {
  // transforma em rect temporário
  const rect = {
    cx: circle.cx,
    cy: circle.cy,
    w: circle.r * 2,
    h: circle.r * 2
  };

  const resizedRect = resizeRect({ rect, direction, currentMap });

  // garante que continua sendo círculo
  const diameter = Math.min(resizedRect.w, resizedRect.h);

  return {
    cx: resizedRect.cx,
    cy: resizedRect.cy,
    r: diameter / 2
  };
}
export function moveCircle({ circle, startMap, currentMap }) {
  const dx = currentMap.x - startMap.x;
  const dy = currentMap.y - startMap.y;

  return {
    cx: circle.cx + dx,
    cy: circle.cy + dy,
    r: circle.r
  };
}
//TODO