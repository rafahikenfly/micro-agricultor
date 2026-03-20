export default function SVGBussola({
  diametro = 140,
  orientacao = 0,
  onLeftClick = () => {},
  onRightClick = () => {},
  onDoubleClick = () => {},
}) {
  const centro = diametro / 2;
  const raio = diametro / 2 - 6;
  const agulha = raio * 0.75;

  // Ângulos permitidos:
  // Colaterais: 45, 135, 225, 315
  // Subcardeais: 22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5
  const angulos = [
    22.5, 45, 67.5,
    112.5, 135, 157.5,
    202.5, 225, 247.5,
    292.5, 315, 337.5,
  ];

  const marcas = angulos.map(ang => {
    const isColateral = ang % 45 === 0;
    return {
      ang,
      tamanho: isColateral ? 10 : 6,
      espessura: isColateral ? 1.5 : 1,
    };
  });

  return (
    <svg
      width={diametro}
      height={diametro}
      viewBox={`0 0 ${diametro} ${diametro}`}
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        if (e.button === 0) onLeftClick(e);
      }}

      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick(e);
      }}

      onDoubleClick={(e) => {
        onDoubleClick(e);
      }}
    >
      {/* Borda */}
      <circle
        cx={centro}
        cy={centro}
        r={raio}
        fill="#f9fafb"
        stroke="#111"
        strokeWidth="2"
      />

      {/* Marcas colaterais + subcardeais selecionadas */}
      {marcas.map((m, i) => (
        <g key={i} transform={`rotate(${m.ang}, ${centro}, ${centro})`}>
          <line
            x1={centro}
            y1={centro - raio}
            x2={centro}
            y2={centro - raio + m.tamanho}
            stroke="#111"
            strokeWidth={m.espessura}
          />
        </g>
      ))}

      {/* Letras cardeais */}
      {[
        { t: "N", a: 0 },
        { t: "E", a: 90 },
        { t: "S", a: 180 },
        { t: "O", a: 270 },
      ].map((d, i) => (
        <g key={i} transform={`rotate(${d.a}, ${centro}, ${centro})`}>
          <text
            x={centro}
            y={centro - raio + 10}
            textAnchor="middle"
            fontSize={diametro * 0.13}
            fontWeight="bold"
            fill="#111"
          >
            {d.t}
          </text>
        </g>
      ))}

      {/* Agulha */}
      <g transform={`rotate(${orientacao}, ${centro}, ${centro})`}>
        {/* Norte */}
        <polygon
          points={`
            ${centro - 6},${centro}
            ${centro + 6},${centro}
            ${centro},${centro - agulha}
          `}
          fill="#d32f2f"
        />

        {/* Sul */}
        <polygon
          points={`
            ${centro - 6},${centro}
            ${centro + 6},${centro}
            ${centro},${centro + agulha}
          `}
          fill="#111"
        />

        {/* Eixo */}
        <circle
          cx={centro}
          cy={centro}
          r="4"
          fill="#111"
        />
      </g>
    </svg>
  );
}
