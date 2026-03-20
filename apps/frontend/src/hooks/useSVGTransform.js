import { useRef } from "react";

  const clamp = (v, min, max) => {
    if (![v, min, max].every(Number.isFinite)) return 0;
    return Math.max(min, Math.min(max, v));
  };

  const MIN_ZOOM = 0.3;
  const MAX_ZOOM = 8;

  const MIN_PAN = -300;
  const MAX_PAN = 1500;

export function useSVGTransform({ onRotate, onZoom } = {}) {
  const gRef = useRef(null);

  // estado imperativo do transform
  const transform = useRef({
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0
  });

  const applyTransform = () => {
    const g = gRef.current;
    if (!g) return;
    const t = transform.current;
    g.setAttribute(
      "transform",
      `translate(${t.x} ${t.y}) scale(${t.scale}) rotate(${t.rotate})`
    );
  };

  const setPan = (x, y) => {
    transform.current.x = clamp(x, MIN_PAN, MAX_PAN);
    transform.current.y = clamp(y, MIN_PAN, MAX_PAN);
    applyTransform();
  };

  const pan = (dx, dy) => {
    transform.current.x = clamp(transform.current.x + dx, MIN_PAN, MAX_PAN);
    transform.current.y = clamp(transform.current.y + dy, MIN_PAN, MAX_PAN);
    applyTransform();
  };

  const setZoom = (scale) => {
    transform.current.scale = clamp(scale, MIN_ZOOM, MAX_ZOOM);
    applyTransform();
    if (onZoom) onZoom(transform.current.scale);
  };

  const zoomAt = (factor, cx, cy) => {
    const t = transform.current;
    const newScale = clamp(t.scale * factor, MIN_ZOOM, MAX_ZOOM);

    t.x = cx - (cx - t.x) * (newScale / t.scale);
    t.y = cy - (cy - t.y) * (newScale / t.scale);
    t.scale = newScale;

    applyTransform();
    if (onZoom) onZoom(t.scale);
  };

  const setRotate = (deg) => {
    transform.current.rotate = deg;
    applyTransform();
    if (onRotate) onRotate(transform.current.rotate);
  };

  const rotate = (deg) => {
    transform.current.rotate += deg;
    applyTransform();
    if (onRotate) onRotate(transform.current.rotate);
  };

  const rotateAt = (deg, cx, cy) => {
    const t = transform.current;
    const angleRad = (deg * Math.PI) / 180;

    // vetor do ponto de rotação até a origem do transform atual
    const dx = t.x - cx;
    const dy = t.y - cy;

    // aplica rotação incremental
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const newX = cx + cos * dx - sin * dy;
    const newY = cy + sin * dx + cos * dy;

    t.x = newX;
    t.y = newY;
    t.rotate += deg;

    applyTransform();
    if (onRotate) onRotate(t.rotate);
  };

  const centerOn = ({ x, y }) => {
    //TODO: ISSO AQUI NÃO ESTÁ LEGAL
    const svg = gRef.current?.ownerSVGElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const { scale } = transform.current;

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const newX = cx - x * scale;
    const newY = cy - y * scale;

    setPan(newX, newY);
  };

  const fitToBounds = (bbox, padding = 50) => {
    const svg = gRef.current?.ownerSVGElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();

    const width = bbox.maxX - bbox.minX;
    const height = bbox.maxY - bbox.minY;

    if (width === 0 || height === 0) return;

    const scaleX = (rect.width - padding * 2) / width;
    const scaleY = (rect.height - padding * 2) / height;

    const scale = clamp(Math.min(scaleX, scaleY), MIN_ZOOM, MAX_ZOOM);

    setZoom(scale);

    const cx = bbox.minX + width / 2;
    const cy = bbox.minY + height / 2;

    centerOn({ x: cx, y: cy });
  };

  const focusOn = ({ posicao, dimensao }, padding = 50) => {
    const bbox = {
      minX: posicao.x - dimensao.x/2,
      minY: posicao.y - dimensao.y/2,
      maxX: posicao.x + dimensao.x/2,
      maxY: posicao.y + dimensao.y/2
    };

    fitToBounds(bbox, padding);
  };
  
  const resetView = () => {
    transform.current = { x: 0, y: 0, scale: 1, rotate: 0 };
    applyTransform();
  };

  return {
    gRef,
    transform: transform.current,
    setPan,
    pan,
    setZoom,
    zoomAt,
    setRotate,
    rotate,
    rotateAt,
    
    centerOn,
    fitToBounds,
    focusOn,
    resetView,
  };
}