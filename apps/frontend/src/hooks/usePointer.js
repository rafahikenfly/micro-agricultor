import { useState, useEffect } from "react";

export function usePointer(ref) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
        const rect = el.getBoundingClientRect();

        setPos({
        x: e.clientX,// - rect.left,
        y: e.clientY,// - rect.top
        });
    };
    el.addEventListener("mousemove", handleMove);

    return () => {
      el.removeEventListener("mousemove", handleMove);
    };
  }, [ref]);

  return pos;
}