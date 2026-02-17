export function getSVGPoint(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

export function rotatePoint(point, angleDeg, cx = 0, cy = 0) {
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

export const getMapPointFromPoint = (p, transform) => {
  // 1) desfaz pan + zoom
  const unscaled = {
    x: (p.x - transform.x) / transform.scale,
    y: (p.y - transform.y) / transform.scale,
  };

  // 2) desfaz rotação (se existir)
  if (transform.rotate) {
    return rotatePoint(
      unscaled,
      -transform.rotate,
    );
  }

  return unscaled;
};
