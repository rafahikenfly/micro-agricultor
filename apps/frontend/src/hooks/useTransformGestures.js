import { useEffect, useRef } from "react";

export function useTransformGestures(svgRef, { active = true, pan, zoom, rotate }) {

  const dragging = useRef(false);
  const rotating = useRef({active: false, cx: 0, cy: 0});
  const pinching = useRef({ active: false, initialDistance: 0 });
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    function getPoint(e) {
      if (e.touches && e.touches.length > 0) {
        return {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
      return { x: e.clientX, y: e.clientY };
    }


    function getTouchesDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function getTouchesCenter(touches) {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
      };
    }

    function onGestureStart(e) {
      if (e.touches && e.touches.length === 2) {
        pinching.current.active = true;
        pinching.current.initialDistance = getTouchesDistance(e.touches);
        return;
      }

      dragging.current = true;

      const point = getPoint(e)

      last.current = point;

      // TODO: Rotate só funciona no desktop via shift key
      if (e.shiftKey) {
        // salva o ponto de rotação em coordenadas SVG
        const rect = svg.getBoundingClientRect();
        rotating.current.active = true;
        rotating.current.cx = point.x - rect.left;
        rotating.current.cy = point.y - rect.top;
      }
    }

    function onGestureMove(e) {
      if (e.touches) e.preventDefault();

      //PINCH
      if (e.touches && e.touches.length === 2) {
        const newDistance = getTouchesDistance(e.touches);
        const factor = newDistance / pinching.current.initialDistance;

        const center = getTouchesCenter(e.touches);
        const rect = svg.getBoundingClientRect();

        zoom(
          factor,
          center.x - rect.left,
          center.y - rect.top
        );

        pinching.current.initialDistance = newDistance;
        return;
      }

      //PAN
      if (!dragging.current) return;

      const point = getPoint(e);

      const dx = point.x - last.current.x;
      const dy = point.y - last.current.y;

      if (rotating.current.active) {
        const deg = dx * 0.5;
        rotate(deg, rotating.current.cx, rotating.current.cy);
      } else {
        pan(dx, dy);
      }

      last.current = point;
    }

    function onGestureEnd() {
      dragging.current = false;
      rotating.current.active = false;
      pinching.current.active = false;
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
      // mouse
      svg.addEventListener("mousedown", onGestureStart);
      window.addEventListener("mousemove", onGestureMove);
      window.addEventListener("mouseup", onGestureEnd);

      // touch (iPad)
      svg.addEventListener("touchstart", onGestureStart);
      window.addEventListener("touchmove", onGestureMove, { passive: false });
      window.addEventListener("touchend", onGestureEnd);
    }
    svg.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      svg.removeEventListener("mousedown", onGestureStart);
      window.removeEventListener("mousemove", onGestureMove);
      window.removeEventListener("mouseup", onGestureEnd);

      svg.removeEventListener("touchstart", onGestureStart);
      window.removeEventListener("touchmove", onGestureMove);
      window.removeEventListener("touchend", onGestureEnd);

      svg.removeEventListener("wheel", onWheel);
    };

  }, [pan, zoom, svgRef]);
}