import React from "react";
import { unixToReadableString } from "../../../utils/dateUtils";
import { ESTADO_GRBL, ESTADO_XYLEMA } from "micro-agricultor";

function MapaTelemetria({ dispositivo }) {
  if (!dispositivo || !dispositivo.telemetria || !dispositivo.posicao) return null;

  // Extrai as coordenadas base do dispositivo para posicionar a telemetria ao lado ou acima dele
  const { x = 0, y = 0 } = dispositivo.posicao;
  const offsetX = -dispositivo.dimensao.x/2;
  const offsetY = dispositivo.dimensao.y/2;

  const estadoGrbl = dispositivo.telemetria.grbl;
  const estadoXylema = dispositivo.telemetria.xylema;
  const telemetriaTs = dispositivo.telemetria.ts;
  const estadoAtuadores = dispositivo.telemetria.atuadores;

  return (
    <g 
      transform={`translate(${x + offsetX}, ${y + offsetY})`}
      style={{ pointerEvents: "none" }} // Evita interferir nos cliques do dispositivo se não desejar
    >
      {/* Fundo do painel de telemetria para legibilidade */}
      <rect
        x="0"
        y="0"
        width="130"
        height="90"
        rx="4"
        fill="rgba(15, 23, 42, 0.85)"
        stroke="#22c55e"
        strokeWidth="1.5"
      />

      {/* Título */}
      <text x="8" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
        {unixToReadableString(telemetriaTs)}
      </text>

      {/* Coordenadas X, Y, Z */}
      <text x="8" y="32" fill="#4ade80" fontSize="7" fontFamily="monospace">
        X:{estadoGrbl.pos.x ?? 0} | Y:{estadoGrbl.pos.y ?? 0} | Z:{estadoGrbl.pos.z ?? 0}
      </text>
      {/* Estados adicionais (Grbl e Xylema) */}
      <text x="8" y="42" fill="#ffffff" fontSize="9" fontFamily="sans-serif">
        Grbl:{ESTADO_GRBL[estadoGrbl.estado]}
      </text>
      <text x="8" y="52" fill="#ffffff" fontSize="9" fontFamily="sans-serif">
        Xyl:{ESTADO_XYLEMA[estadoXylema.estado]}
      </text>
      <text x="8" y="62" fill="#ffffff" fontSize="9" fontFamily="sans-serif">
        Buffer | Grbl:{estadoGrbl.bf} | Xyl:{estadoXylema.bf}
      </text>

      {/* Atuadores */}
      <g transform="translate(8, 72)">
        {estadoAtuadores.map((atuador, index) => {
          const valor = atuador.estado ?? 0;
          const isAtivo = valor > 0;

          // Regra de cores: 
          // Valor === 0 -> Fundo branco, borda e texto pretos
          // Valor > 0  -> Fundo vermelho, borda vermelha escura e texto branco
          const fillColor = isAtivo ? "#ef4444" : "#ffffff";
          const strokeColor = isAtivo ? "#b91c1c" : "#000000";
          const textColor = isAtivo ? "#ffffff" : "#000000";

          return (
            <g key={index} transform={`translate(${index * 22}, 0)`}>
              <circle
                cx="6"
                cy="6"
                r="8"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="1.5"
              />
              <text
                x="6"
                y="9.5"
                fill={textColor}
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {index}
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
}

export default React.memo(MapaTelemetria);