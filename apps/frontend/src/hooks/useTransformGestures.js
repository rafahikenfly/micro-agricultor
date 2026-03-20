import { useEffect, useRef } from "react";

export function useTransformGestures(svgRef, { active = true, pan, zoom, rotate }) {

  const dragging = useRef(false);
  const rotating = useRef({active: false, cx: 0, cy: 0});
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    function onMouseDown(e) {
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };

      if (e.shiftKey) {
        // salva o ponto de rotação em coordenadas SVG
        const rect = svg.getBoundingClientRect();
        rotating.current.active = true;
        rotating.current.cx = e.clientX - rect.left;
        rotating.current.cy = e.clientY - rect.top;
      }
    }

    function onMouseMove(e) {
      if (!dragging.current) return;

      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;

      if (rotating.current.active) {
        const deg = dx * 0.5;
        rotate(deg, rotating.current.cx, rotating.current.cy);
      } else {
        pan(dx, dy);
      }

      last.current = { x: e.clientX, y: e.clientY };
    }

    function onMouseUp() {
      dragging.current = false;
      rotating.current.active = false;      
    }

    function onWheel(e) {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();

      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.1 : 0.9;

      zoom(factor, cx, cy);
    }
    if (active) {
      svg.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    svg.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      svg.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      svg.removeEventListener("wheel", onWheel);
    };

  }, [pan, zoom, svgRef]);
}