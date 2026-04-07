import { useEffect, useState } from "react";
import { Form, Card, Table, Spinner } from "react-bootstrap";
import ApexCharts from "react-apexcharts";
import Loading from "./Loading";
import { useCache } from "../hooks/useCache";

const Evolucao = ({ entidades = [], caracteristicas = [] }) => {
  const {cacheEventos, cacheMutacoes, reading } = useCache(["eventos", "mutacoes"])

  // ========== MONTAR SERIES ==========
  const series = [];

for (const caracteristica of caracteristicas) {
  for (const entidade of entidades) {
      const dados = (cacheMutacoes?.list ?? [])
        .filter(mutacao => mutacao.entidadeId === entidade.id && mutacao.caracteristicaId === caracteristica.id)
        .map(dado => {
          const confianca = (dado.confianca ?? 100)
          const valor = dado.valor;
          const incerteza =  Math.pow(1 - confianca/100, 2); //TODO: Mudar isso para um modelo estatístico de verdade
          const lower = Number((valor * (1 - incerteza)).toFixed(2));
          const upper = Number((valor * (1 + incerteza)).toFixed(2));

          return {
            x: dado.persistedAt?.toDate?.() || new Date(),
            valor,
            lower,
            upper,
            confianca,
          };
        })
        .sort((a, b) => a.x - b.x);
  
        if (dados.length === 0) continue;

      // --- Área de incerteza (rangeArea) ---
      series.push({
        type: "rangeArea",
        name: `${entidade.nome} (Incerteza)`,
        data: dados.map(d => ({
          x: d.x,
          y: [d.lower, d.upper]
        })),
      });
  
      // --- Linha central (valor) ---
      series.push({
        type: "line",
        name: `${entidade.nome} - ${caracteristica.nome}`,
        data: dados.map(d => ({
          x: d.x,
          y: d.valor,
          confianca: d.confianca,
          caracteristica: caracteristica.nome,
        }))
      });
    }
  }

  // ========== APEX OPTIONS ==========
const options = {
  chart: {
    height: 800,
    type: "rangeArea",
    animations: { speed: 500 },
    toolbar: { show: true }
  },

  dataLabels: { enabled: false },

  stroke: {
    curve: "smooth",
    width: [1, 3]
  },
  fill: {
    opacity: [0.1, 1]
  },
  states: {
    hover: {
      filter: {
        type: "none"
      }
    },
    active: {
      filter: {
        type: "none"
      }
    }
  },
  xaxis: {
    type: "datetime"
  },
  markers: {
    size: series.map(s => s.type === "line" ? 4 : 0),
    hover: {
      sizeOffset: 5
    }
  },
  legend: {
    show: true,
    inverseOrder: true,
  },
  tooltip: {
    shared: false,
    intersect: true,
    custom: ({ seriesIndex, dataPointIndex, w }) => {
      const serie = w.config.series[seriesIndex];
      const cor = w.globals.colors[seriesIndex];

      // Só renderiza tooltip para série line
      if (!serie || serie.type !== "line") return "";

      const ponto = serie.data[dataPointIndex];
      if (!ponto) return "";

      const valor = Number(ponto.y).toFixed(2);
      const confianca = Number(ponto.confianca ?? 0).toFixed(2);

      const data = new Date(ponto.x).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "medium"
      });

      // Busca série rangeArea correspondente
      const rangeSerie = w.config.series.find(s => s.type === "rangeArea");
      const rangePoint = rangeSerie?.data[dataPointIndex];

      let intervaloTexto = "";
      if (rangePoint && Array.isArray(rangePoint.y)) {
        const [min, max] = rangePoint.y.map(v => Number(v).toFixed(2));
        intervaloTexto = ` (${min} – ${max})`;
      }

      return `
        <div style="
          padding:10px;
          background:white;
          border-radius:8px;
          box-shadow:0 4px 12px rgba(0,0,0,0.15);
          font-size:13px;
        ">
          <div style="color:${cor}; font-weight:600; margin-bottom:6px;">
            ${serie.name}
          </div>

          <div style="color:#666; margin-bottom:6px;">
            ${data}
          </div>

          <div>
            ${ponto.caracteristica}: 
            <b>${valor}</b>
          </div>

          <div>
            Confiança: 
            <b>${confianca}%</b>${intervaloTexto}
          </div>
        </div>
      `;
    }
  }
};


  if (reading) return <Loading />;
  if (!caracteristicas.length || !series.length) {
    return <div>Sem dados para exibir</div>;
  }

  return (
    <div>
      {/* ----- Gráfico ----- */}
      <Card className="mb-3 p-2">
        <ApexCharts
          options={options}
          series={series}
          type="line"
          height={350}
        />
      </Card>
    </div>
  );
};

export default Evolucao;