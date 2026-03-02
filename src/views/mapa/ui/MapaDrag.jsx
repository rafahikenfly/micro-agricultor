import { useMapaEngine } from "../MapaEngine";

export default function MapaDrag() {
  const engine = useMapaEngine();

  const geometria = engine.state.draw.geometria; //TODO: NEM SEMPRE VAI SER DO DRAW!
  const start = engine.state.drag?.start;
  const end = engine.state.drag?.end;

  // Não renderiza se não houver drag válido
  if (!start || !end) return null;

  // Normaliza coordenadas (drag pode ser em qualquer direção)
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(dx);
  const height = Math.abs(dy);
  
  // Evita render inútil
  if (width === 0 || height === 0) return null;

  const commonProps = {
    fill: "rgba(0, 123, 255, 0.2)",
    stroke: "rgba(0, 123, 255, 0.9)",
    strokeWidth: 1,
    strokeDasharray: "6 4",
    pointerEvents: "none",
  };

  switch (geometria) {
    case "rect":
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          {...commonProps}
        />
      );

    case "circle": {
      const r = Math.sqrt(dx * dx + dy * dy);
      return (
        <circle
          cx={start.x}
          cy={start.y}
          r={r}
          {...commonProps}
        />
      );
    }

    case "ellipse":
      return (
        <ellipse
          cx={x + width / 2}
          cy={y + height / 2}
          rx={width / 2}
          ry={height / 2}
          {...commonProps}
        />
      );

    default:
      return null;
  }
}
