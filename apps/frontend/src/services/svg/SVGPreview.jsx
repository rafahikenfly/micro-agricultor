export function SVGPreview({ pontos, style = {}, geometria = "circle" }) {
  if (!pontos) return null;

  const stylePadrao = {
    radius: 6,
    fill: "green",
    width: 6,
    height: 6,
  }

  return (
    <g opacity={0.6}>
      {pontos.map((p, i) => {
        switch (geometria) {
          case "rect":
            return (
              <rect
                key={i}
                x={p.x}
                y={p.y}
                width={style.width || stylePadrao.width}
                height={style.height || stylePadrao.height}
                fill={style.fill || stylePadrao.fill}
              />
            )
          default:
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={style.radius || stylePadrao.radius}
                fill={style.fill || stylePadrao.fill}
              />
            )
        }
      })}
    </g>
  );
}