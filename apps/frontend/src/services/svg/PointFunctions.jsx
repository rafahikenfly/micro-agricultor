//TRANSFORM DO GRUPO
//1) translate
//2) scale (também em torno da origem 0,0)
//3) rotate (em torno da origem 0,0!)

export const getSVGPoint = (svg, clientX, clientY) => {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

export const rotatePoint = (point, angleDeg, cx = 0, cy = 0) => {
  const angle = (angleDeg * Math.PI) / 180; // graus → radianos

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // translada para origem
  const dx = point.x - cx;
  const dy = point.y - cy;

  // rotaciona
  const rx = dx * cos - dy * sin;
  const ry = dx * sin + dy * cos;

  // volta para o centro
  return {
    x: rx + cx,
    y: ry + cy,
  };
}

export const getMapPointFromPoint = (svgPoint, transform) => {
  // 1) untranslate
  const untranslated = {
    x: svgPoint.x - transform.x,
    y: svgPoint.y - transform.y,
  };
  
  // 2) unscale
  const unscale = {
   x: untranslated.x / transform.scale,
   y: untranslated.y / transform.scale,
 };

 // 3) unrotate
  return unrotated = transform.rotate
    ? rotatePoint(unscale, -transform.rotate)
    : unscale;
};

export const getSvgPointFromPoint = (mapPoint, transform) => {
  // 3) scale
  //TODO: MUDOU A ORDEM, SCALE É 2
  const scaled =  {
    x: mapPoint.x * transform.scale,
    y: mapPoint.y * transform.scale,
  };

  // 2) rotate
  const rotated = transform.rotate
    ? rotatePoint(scaled, transform.rotate)
    : scaled;

  // 1) translate
  return {
    x: rotated.x + transform.x,
    y: rotated.y + transform.y,
  };


};

export const getMapPointFromEvent = (e, transform) => {
  const svg = e.currentTarget.closest("svg");
  if (!svg) return null;
  const cursor = getSVGPoint(svg, e.clientX, e.clientY);
  const mapPoint = getMapPointFromPoint(cursor, transform)
  return mapPoint;
}

export const getMouseInMapSpace = (svg, g, clientX, clientY) => {
  // Verificação crucial:
  if (!svg || !g || isNaN(clientX) || isNaN(clientY)) {
    return { x: 0, y: 0 }; 
  }

  const svgPoint = getSVGPoint(svg, clientX, clientY)
  const mapPoint = svgPoint.matrixTransform(g.getCTM().inverse());
  return mapPoint;
};

export const pointNearBorder = (p, entidade, tolerance = 8) => {
  const { posicao, dimensao, aparencia } = entidade;
  const geometria = aparencia?.geometria;

  if (!geometria || geometria === "polygon") return false;

  // CIRCLE
  if (geometria === "circle") {
    const dx = p.x - posicao.x;
    const dy = p.y - posicao.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = dimensao.x / 2;

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

/* export const getResizeBox = (entidade, resizeState, grid = 1) => {
  const snap = (value) => Math.round(value / grid) * grid;

  const top = entidade.posicao.y - (entidade.dimensao.y / 2);
  const bottom = entidade.posicao.y + (entidade.dimensao.y / 2);
  const left = entidade.posicao.x - (entidade.dimensao.x / 2);
  const right = entidade.posicao.x + (entidade.dimensao.x / 2);

  const box = {
    x: left,
    y: top,
    width: entidade.dimensao.x,
    height: entidade.dimensao.y
  };

  if (!resizeState.current) return box;

  const MIN = 10;
  const { x, y } = resizeState.current;
  const direction = resizeState.direction;

  if (direction.includes("e")) {
    const newRight = Math.max(x, left + MIN);
    box.width = newRight - left;
  }

  if (direction.includes("w")) {
    const newLeft = Math.min(x, right - MIN);
    box.x = newLeft;
    box.width = right - newLeft;
  }

  if (direction.includes("s")) {
    const newBottom = Math.max(y, top + MIN);
    box.height = newBottom - top;
  }

  if (direction.includes("n")) {
    const newTop = Math.min(y, bottom - MIN);
    box.y = newTop;
    box.height = bottom - newTop;
  }

  return {
    x: snap(box.x),
    y: snap(box.y),
    width: snap(box.width),
    height: snap(box.height),
  };
} */

export const getResizeCircle = (entidade, resizeState, grid = 1) => {
  const snap = (value) => Math.round(value / grid) * grid;

  const MIN = 10;

  const { x, y } = resizeState.current || {};
  const direction = resizeState.direction;

  const cxInicial = entidade.posicao.x;
  const cyInicial = entidade.posicao.y;
  const rInicial = Math.max( entidade.dimensao.x, entidade.dimensao.y ) / 2;

  // Sem resize retorna original
  if (!resizeState.current) {
    return {
      cx: cxInicial,
      cy: cyInicial,
      r: rInicial,
    };
  }

  // Determina ancoragem
  let anchorX = cxInicial;
  let anchorY = cyInicial;

  if (direction.includes("e")) anchorX -= rInicial;
  if (direction.includes("w")) anchorX += rInicial;
  if (direction.includes("n")) anchorY += rInicial;
  if (direction.includes("s")) anchorY -= rInicial;

  // Nova distância entre anchor e handle
  const dx = x - anchorX;
  const dy = y - anchorY;

  const diameter = Math.max(
    Math.abs(dx),
    Math.abs(dy),
    MIN
  );

  const r = diameter / 2;

  // Novo centro baseado no anchor
  let cx = anchorX;
  let cy = anchorY;

  if (direction.includes("e")) cx += r;
  if (direction.includes("w")) cx -= r;
  if (direction.includes("s")) cy += r;
  if (direction.includes("n")) cy -= r;

  return {
    cx: snap(cx),
    cy: snap(cy),
    r: snap(r),
  };
};
export const getCenterFromBox = (box) => {
  return ({
    posicao: {
      x: box.x + (box.width/2),
      y: box.y + (box.height/2),
    },
    dimensao: {
      x: box.width,
      y: box.height,
    },
  })
}

export const getBoundsFromCenter = (center) => {
  return ({
    top: center.posicao.y - (center.dimensao.y / 2),
    bottom: center.posicao.y + (center.dimensao.y / 2),
    left: center.posicao.x - (center.dimensao.x / 2),
    right: center.posicao.x + (center.dimensao.x / 2),
  })
}

/* export const getPreviewPoints = ({ mousePos, preview, linhas, colunas, espacamentoLinha, espacamentoColuna, }) => {
  if (!mousePos) return [];

  const offsetVisual = 0.5
  const start = {};

  switch (preview.geometria) {
    case "circle":
      // Circulo tem centro x e y e raio
      // Deve começar pelo menos um raio antes do mousePos, alem do espacamento e offset
      start.x = mousePos.x
        - preview.radius
        - (colunas - 1) * espacamentoColuna
        - offsetVisual;
      start.y = mousePos.y
        - preview.radius
        - (linhas - 1) * espacamentoLinha;
        - offsetVisual;
      break;
    case "rect":
      // Retângulo tem x,y,width e height
      // Deve começar pelo menos um width antes do mousePos, alem do espacamento e offset
      start.x = mousePos.x
        - preview.width
        - (colunas - 1) * espacamentoColuna
        - offsetVisual;
      start.y = mousePos.y
        - preview.height
        - (linhas - 1) * espacamentoLinha
        - offsetVisual;
    default:
      break;
  }
  
  const result = [];
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      result.push({
        x: start.x + (c * espacamentoColuna),
        y: start.y + (l * espacamentoLinha),
      });
    }
  }

  return result;
} */