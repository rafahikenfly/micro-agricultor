import { useState, useRef } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function SVGMapa({
  vertices = [],          // vértices do polígono do mapa
  orientacao = 0,         // orientação em graus do norte do polígono
  mode = "pan",           // drag, click, pan, zoom
//  isZooming = false,      // deve ou não gerenciar zoom
//  isPanning = false,      // deve ou não gerenciar pan
  grid = [],              // array com o tamanho do grid primário, secundário..., se houver
  drag,                   // comportamento de drag
  onClick,                // comportamento de click
  children,
}) {
  /* ================= ESTADO ================= */
  const [dragStart, setDragStart] = useState(null);
  const [dragCoordinates, setDragCoordinates] = useState(null);

  const [view, setView] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [panning, setPanning] = useState(false);
  const panStart = useRef(null);

  /* ================= BOUNDING BOX ================= */
  const getBoundingBox = (vertices) => {
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

  const bbox = getBoundingBox(vertices);
  const diagonal = Math.sqrt(bbox.width ** 2 + bbox.height ** 2);

  const offsetX = (diagonal - bbox.width) / 2 - bbox.minX;
  const offsetY = (diagonal - bbox.height) / 2 - bbox.minY;

  const worldBounds = {
    minX: 0,
    minY: 0,
    maxX: diagonal,
    maxY: diagonal,
  };

  /* ================= LIMITES PAN ================= */
  const clampPan = (x, y, scale) => {
    const margin = 60;

    const minX = -(worldBounds.maxX * scale) + margin;
    const maxX = margin;

    const minY = -(worldBounds.maxY * scale) + margin;
    const maxY = margin;

    return {
      x: clamp(x, minX, maxX),
      y: clamp(y, minY, maxY),
    };
  };

  /* ================= LIMITES DRAG ================= */
  const pointInPolygon = (point, polygon) => {
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
  
  /* ================= CONVERSÃO SVG ================= */
  const getSVGPoint = (evt) => {
    const svg = evt.currentTarget.ownerSVGElement || evt.currentTarget;
    if (!svg?.createSVGPoint) return null;

    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;

    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

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

  const getMapPoint = (evt) => {
    const p = getSVGPoint(evt);
    if (!p) return null;

    const unscaled = {
      x: (p.x - view.x) / view.scale,
      y: (p.y - view.y) / view.scale,
    };

    const local = {
      x: unscaled.x - offsetX,
      y: unscaled.y - offsetY,
    };

    return rotatePoint(
      local,
      -orientacao,
      bbox.centerX,
      bbox.centerY
    );
  };

  /* ================= GRID ================= */
  const renderGrid = (step, stroke, strokeWidth) => {
    const linhas = [];

    for (let i = 0; i <= bbox.maxX; i += step) {
      linhas.push(
        <line key={`v-${i}`} x1={i} y1={0} x2={i} y2={bbox.maxY}
          stroke={stroke} strokeWidth={strokeWidth} />
      );
    }

    for (let j = 0; j <= bbox.maxY; j += step) {
      linhas.push(
        <line key={`h-${j}`} x1={0} y1={j} x2={bbox.maxX} y2={j}
          stroke={stroke} strokeWidth={strokeWidth} />
      );
    }

    return linhas;
  };

  /* ============= PAN // DRAG ================= */
  const handleMouseDown = (evt) => {
    if (mode === "pan") {
      setPanning(true);
      panStart.current = { x: evt.clientX, y: evt.clientY };
    }

    if (mode === "drag") {
      if (!drag?.onDrag) return;
  
      const p = getMapPoint(evt);
      if (!p) return;
      if (drag.limit && !pointInPolygon(p, vertices)) return;

      setDragStart(p);
      setDragCoordinates({ x: p.x, y: p.y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (evt) => {
    if (mode === "pan") {
      if (!panning) return;
  
      const dx = evt.clientX - panStart.current.x;
      const dy = evt.clientY - panStart.current.y;
  
      panStart.current = { x: evt.clientX, y: evt.clientY };
  
      setView(v => {
        const next = clampPan(
          v.x + dx / v.scale,
          v.y + dy / v.scale,
          v.scale
        );
        return { ...v, ...next };
      });
    }

    if (mode === "drag") {
      if (!dragStart) return;

      const p = getMapPoint(evt);
      if (!p) return;
      if (drag.limit && !pointInPolygon(p, vertices)) return;
  
      if (drag.preview === "rect") {
        setDragCoordinates({
          x: Math.min(dragStart.x, p.x),
          y: Math.min(dragStart.y, p.y),
          width: Math.abs(p.x - dragStart.x),
          height: Math.abs(p.y - dragStart.y),
        });
      }
    
      if (drag.preview === "circle") {
        const dx = p.x - dragStart.x;
        const dy = p.y - dragStart.y;
    
        setDragCoordinates({
          cx: dragStart.x,
          cy: dragStart.y,
          r: Math.sqrt(dx * dx + dy * dy),
        });
      }
    } 
  };

  const handleMouseUp = () => {
    if (mode === "pan") {
      setPanning(false);
      panStart.current = null;
    }

    if (mode == "drag") {
      if (dragCoordinates) drag?.onDrag(dragCoordinates);
      setDragStart(null);
      setDragCoordinates(null);
    }
  };

  /* ================= ZOOM ================= */
  const handleWheelZoom = (evt) => {
    evt.preventDefault();

    const mouse = getSVGPoint(evt);
    if (!mouse) return;

    setView(v => {
      const newScale = clamp(v.scale - evt.deltaY * 0.001, 0.6, 4);
      const ratio = newScale / v.scale;

      const next = clampPan(
        mouse.x - (mouse.x - v.x) * ratio,
        mouse.y - (mouse.y - v.y) * ratio,
        newScale
      );

      return { scale: newScale, ...next };
    });
  };

  /* ============= GESTURE PROVIDERS ======== */
  const wheelProvider = () => {
    if (mode === "zoom") return handleWheelZoom;
    else return;
  }

  /* ================= SVG ================= */
  const polygonPoints = vertices.map(v => `${v.x},${v.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${diagonal} ${diagonal}`}
      style={{ width: "100%", height: "100%", background: "#f5f5f5" }}
      onWheel={wheelProvider()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <g transform={`translate(${view.x}, ${view.y}) scale(${view.scale})`}>
        <g transform={`translate(${offsetX}, ${offsetY}) rotate(${orientacao}, ${bbox.centerX}, ${bbox.centerY})`}>

          {/* MAPA */}
          <polygon
            points={polygonPoints}
            fill="#d8f3dc"
            stroke="#2d6a4f"
            strokeWidth={0.1}
          />

          {/* GRID */}
          <defs>
            <clipPath id="clip-horta">
              <polygon points={polygonPoints} />
            </clipPath>
          </defs>

          <g clipPath="url(#clip-horta)">
            {grid.reverse().map((g,idx) => renderGrid(g, "#00000055", 0.05 * (idx + 1)) )}
            {children}
          </g>

          {/* DRAG PREVIEW */}
          {dragCoordinates && drag?.preview === "rect" && (
            <rect
              {...dragCoordinates}
              fill="rgba(13,110,253,0.3)"
              stroke="#0d6efd"
              strokeDasharray="2"
            />
          )}
          {dragCoordinates && drag?.preview === "circle" && (
            <circle
              {...dragCoordinates}
              fill="rgba(13,110,253,0.3)"
              stroke="#0d6efd"
              strokeDasharray="2"
            />
          )}

        </g>
      </g>
    </svg>
  );
}