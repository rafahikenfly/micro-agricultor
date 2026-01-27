export default function SVGBussola({
    diametro = 100,
    orientacao = 0, // graus em relação ao norte
    onClick = ()=>{},
  }) {
    const centro = diametro / 2;
    const raio = diametro / 2 - 4; // margem interna
    const seta = raio * 0.75;
  
    return (
      <svg
        width={diametro}
        height={diametro}
        viewBox={`0 0 ${diametro} ${diametro}`}
      >
        {/* Base da bússola */}
        <circle
          cx={centro}
          cy={centro}
          r={raio}
          fill="white"
          stroke="black"
          strokeWidth="2"
          onClick={onClick}
        />
  
        {/* Seta do norte */}
        <g transform={`rotate(${orientacao}, ${centro}, ${centro})`}>
          <line
            x1={centro}
            y1={centro}
            x2={centro}
            y2={centro - seta}
            stroke="red"
            strokeWidth="3"
            strokeLinecap="round"
          />
  
          {/* ponta da seta */}
          <polygon
            points={`
              ${centro - 5},${centro - seta + 8}
              ${centro + 5},${centro - seta + 8}
              ${centro},${centro - seta - 4}
            `}
            fill="red"
          />
        {/* Letra N */}
          <text
            x={centro}
            y={centro - raio + 16}
            textAnchor="middle"
            fontSize={diametro * 0.15}
            fontWeight="bold"
            fill="black"
          >
            N
          </text>
        </g>
      </svg>
    );
  }
  