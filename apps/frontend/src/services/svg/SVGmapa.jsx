import { useState, useRef, } from "react";
import { getEventSVGPoint, getMapPointFromPoint, pointInPolygon } from "./useMapTransform";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function SVGMapa({
  vertices = [],          // vértices do polígono do mapa
  view,
  setView,
  mapWorld,
  hasZooming = false,      // deve ou não gerenciar zoom
  hasPanning = false,      // deve ou não gerenciar pan
  grid = [],               // array com o tamanho do grid primário, secundário..., se houver
  drag = null,                    // comportamento de drag {onDrag: function, previewTag: "rect" || "circle", style: {}, limit:boolean}
  onClick,                 // comportamento de click
  children,
}) {
  /* ================= ESTADO ================= */
  const [dragStart, setDragStart] = useState(null);
  const [dragCoordinates, setDragCoordinates] = useState(null);

  const panStart = useRef(null);

  /* ================= LIMITES PAN ================= */
  const clampPan = (x, y, scale) => {
    const margin = 60;

    const minX = -(mapWorld.bounds.maxX * scale) + margin;
    const maxX = margin;

    const minY = -(mapWorld.bounds.maxY * scale) + margin;
    const maxY = margin;

    return {
      x: clamp(x, minX, maxX),
      y: clamp(y, minY, maxY),
    };
  };

  /* ================= GRID ================= */
  const renderGrid = (step, stroke, strokeWidth) => {
  const linhas = [];

  const fontSize = 5; // tamanho base no mundo do mapa
  const textOffset = 1.5;

  // Linhas verticais + números X
  for (let i = 0; i <= view.bbox.maxX; i += step) {
    linhas.push(
      <g key={`v-${i}`}>
        <line
          x1={i}
          y1={0}
          x2={i}
          y2={view.bbox.maxY}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <text
          x={i + textOffset}
          y={fontSize + 2}
          fontSize={fontSize}
          fill="#00000099"
          pointerEvents="none"
          transform={`scale(${1 / view.scale}) translate(${(i + textOffset) * (view.scale - 1)}, ${(fontSize + 2) * (view.scale - 1)})`}
        >
          {Math.round(i)}
        </text>
      </g>
    );
  }

  // Linhas horizontais + números Y
  for (let j = 0; j <= view.bbox.maxY; j += step) {
    linhas.push(
      <g key={`h-${j}`}>
        <line
          x1={0}
          y1={j}
          x2={view.bbox.maxX}
          y2={j}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <text
          x={2}
          y={j - textOffset}
          fontSize={fontSize}
          fill="#00000099"
          pointerEvents="none"
          transform={`scale(${1 / view.scale}) translate(${2 * (view.scale - 1)}, ${(j - textOffset) * (view.scale - 1)})`}
        >
          {Math.round(j)}
        </text>
      </g>
    );
  }

  return linhas;
};


  const handleMouseDown = (evt) => {
    // Prioritário é o drag
    const p = getMapPointFromPoint(getEventSVGPoint(evt), view, mapWorld);
    if (!p) return;
    if (drag) {  
      if (drag.limit && !pointInPolygon(p, vertices)) return;

      setDragStart(p);
      setDragCoordinates({ x: p.x, y: p.y, width: 0, height: 0 });
    }

    // Sem drag, vem pan
    else if (hasPanning) {
      panStart.current = p;
    }
  };

  const handleMouseMove = (evt) => {
    const p = getMapPointFromPoint(getEventSVGPoint(evt), view, mapWorld);
    if (!p) return;
    if (drag && dragStart) {
      if (drag.limit && !pointInPolygon(p, vertices)) return;
  
      if (drag.previewTag === "rect") {
        setDragCoordinates({
          x: Math.min(dragStart.x, p.x),
          y: Math.min(dragStart.y, p.y),
          width: Math.abs(p.x - dragStart.x),
          height: Math.abs(p.y - dragStart.y),
        });
      }
    
      if (drag.previewTag === "circle") {
        const dx = p.x - dragStart.x * view.scale;
        const dy = p.y - dragStart.y * view.scale;
    
        setDragCoordinates({
          cx: dragStart.x,
          cy: dragStart.y,
          r: Math.sqrt(dx * dx + dy * dy),
        });
      }
    } 
    else if (panStart.current) {
      // diferença do movimento do mouse
      const dx = p.x - panStart.current.x / view.scale;
      const dy = p.y - panStart.current.y / view.scale;

      // atualiza referência
      panStart.current = p;

      // atualiza a view com limites
      setView(prev => {
        const next = clampPan(
          prev.x + dx,
          prev.y + dy,
          prev.scale
        );
        return { ...prev, ...next };
      });
    }
  };

  const handleMouseUp = () => {
    if (drag && dragCoordinates) {
      drag.onDrag(dragCoordinates);
      setDragStart(null);
      setDragCoordinates(null);
    }
    else if (panStart.current) {
//      setPanning(false);
      panStart.current = null;
    }
  };

  /* ================= ZOOM ================= */
  const handleWheelZoom = (evt) => {
    evt.preventDefault();

    const mouse = getEventSVGPoint(evt);
    if (!mouse) return;

    setView(v => {
      const newScale = clamp(v.scale - evt.deltaY * 0.001, 0.6, 4);
      const ratio = newScale / v.scale;

      const next = clampPan(
        mouse.x - (mouse.x - v.x) * ratio,
        mouse.y - (mouse.y - v.y) * ratio,
        newScale,
      );

      return { ...v, scale: newScale, ...next };
    });
  };

  const wheelProvider = () => {
    if (hasZooming) return handleWheelZoom;
    else return;
  }

  /* ================= SVG ================= */
  const polygonPoints = vertices.map(v => `${v.x},${v.y}`).join(" ");

  if (!mapWorld) return;
  return (
    <svg
      viewBox={`0 0 ${mapWorld.diagonal} ${mapWorld.diagonal}`}
      style={{ width: "100%", height: "100%", background: "#f5f5f5" }}
      onWheel={wheelProvider()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <g transform={`translate(${view.x}, ${view.y}) scale(${view.scale})`}>
        <g
          transform={`
            translate(${mapWorld.offsetX}, ${mapWorld.offsetY})
            translate(${view.bbox.cX}, ${view.bbox.cY})
            rotate(${view.rotate})
            translate(${-view.bbox.cX}, ${-view.bbox.cY})
          `}
        >
          {/* 1/3 MAPA PRINCIPAL */}
          <polygon
            points={polygonPoints}
            fill="#d8f3dc"
            stroke="#2d6a4f"
            strokeWidth={0.1}
          />

          {/* 2/3 GRID */}
          <defs>
            <clipPath id="clip-horta">
              <polygon points={polygonPoints} />
            </clipPath>
          </defs>

          <g clipPath="url(#clip-horta)">
            {grid.reverse().map((g,idx) => renderGrid(g, "#00000055", 0.05 * (idx + 1)) )}
            {children}
          </g>

          {/* 3/3 DRAG PREVIEW */}
          {dragCoordinates && drag?.previewTag === "rect" && (
            <rect
              {...dragCoordinates}
              {...drag.style}
            />
          )}
          {dragCoordinates && drag?.previewTag === "circle" && (
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