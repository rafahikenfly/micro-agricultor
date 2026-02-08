export function getSVGPoint(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
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
