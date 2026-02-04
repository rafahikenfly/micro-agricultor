export function MapPreview({ preview }) {
  if (!preview) return null;

  return (
    <g opacity={0.6}>
      {preview.pontos.map((p, i) => {
        return (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={preview.radius || 6}
          fill={preview.fill || "green"}
        />
      )})}
    </g>
  );
}