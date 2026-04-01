import { useState, useCallback } from "react";

export function useDrag() {
  const [drag, setDrag] = useState({
    isDragging: false,
    start: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
  });

  const dragStart = useCallback((e, options = {}) => {
    e.stopPropagation();

    // Pegar coordenadas relativas ao SVG/Container
    const mouse = {x: e.clientX, y: e.clientY}

    const { entidade = {}, tipoEntidadeId = "", direction = "", customStart = mouse, type = "generic" } = options;


    setDrag({
      entidade,
      tipoEntidadeId,
      direction,
      isDragging: true,
      type,
      start: customStart,
      current: mouse,
    });
  }, []);

  const dragMove = useCallback((e) => {
    if (!drag.isDragging) return;

//    const rect = containerRef.current.getBoundingClientRect();
    setDrag(prev => ({
      ...prev,
      current: { 
        x: e.clientX,// - rect.left, 
        y: e.clientY,// - rect.top 
      },
    }));
  }, [drag.isDragging]);

  const dragFinish = useCallback((e) => {
    e.stopPropagation();
    setDrag(prev => ({ ...prev, isDragging: false }));
  }, []);

  return { drag, dragStart, dragMove, dragFinish };
}