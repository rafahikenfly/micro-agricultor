import { getSVGPoint } from "../../../services/svg/PointFunctions";

export function createMapaInputHandler(engine, state) {
  return {
    onWheel(e) {
      if (!e.shiftKey) return;
      e.preventDefault();

      const svg = e.currentTarget.querySelector("svg");
      const p = getSVGPoint(svg, e.clientX, e.clientY);

      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      engine.zoomAt(factor, p.x, p.y);
    },

    onMouseMove(e) {
      const svg = e.currentTarget.querySelector("svg");
      if (!svg) return;

      // PAN → shift + drag OU tool pan (não atualiza mousePos)
      if ((e.buttons === 1 && e.shiftKey) ||
          (state.activeTool === "pan" && e.buttons === 1)) {
        e.preventDefault();
        engine.onMousePan(e.movementX, e.movementY);
        return;
      }

      // ROTATE → alt + drag OU tool rotate (não atualiza mousePos)
      if ((e.buttons === 1 && e.altKey) ||
          (state.activeTool === "rotate" && e.buttons === 1))  {
        e.preventDefault();
        const rotationSpeed = 0.2;
        engine.onRotateGesture(e.movementX * rotationSpeed);
        return;
      }

      // TRACK MOUSE (preview, snap, hover, etc)
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;

      const cursor = pt.matrixTransform(svg.getScreenCTM().inverse());

      engine.setMousePos(cursor);
    }
  };
}
