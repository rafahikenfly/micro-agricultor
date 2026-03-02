import { useEffect, useState } from "react";
import { Form, Card, Table, Spinner } from "react-bootstrap";
import ApexCharts from "react-apexcharts";
import { catalogosService } from "../../../services/catalogosService";
import { eventosService } from "../../../services/history/eventosService";
import { historicoEfeitosService } from "../../../services/history/efeitosService";
import Loading from "../../../components/common/Loading";
// import { eventosService } from "../../services/crud/eventosService";

const HistoricoTab = ({ selectionData, caracteristica }) => {
//  const [caracteristicas, setCaracteristicas] = useState([]);     // catálogo de características
//  const [seriesDisponiveis, setSeriesDisponiveis] = useState([]); // todas as séries históricas disponíveis
//  const [serieSelecionada, setSerieSelecionada] = useState(null); // única
  const [eventos, setEventos] = useState([]);
  const [efeitos, setEfeitos] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========== CARREGAR DADOS ===========
  useEffect(() => {
    if (!selectionData) return;

    setLoading(true);

    // ----- EVENTOS -----
    const unsubEventos = eventosService.subscribe(
      (data) => {
        setEventos(data);
        setLoading(false);
      },
      [],
      { field: "persistedAt", direction: "desc" }
    );

    // ----- HISTÓRICO DE EFEITOS -----
    const unsubEfeitos = historicoEfeitosService.subscribe(
      (data) => {
        setEfeitos(data);
        setLoading(false);
      },
      [],
      { field: "persistedAt", direction: "desc" }
    );

    return () => {
      unsubEventos();
      unsubEfeitos();
    };
  }, [selectionData]);

  // ========== MONTAR SERIES ==========
  const series = [];

  if (caracteristica.id) {
    for (const entidade of selectionData) {
      const dados = efeitos
        .filter(ef => ef.entidadeId === entidade.id && ef.caracteristicaId === caracteristica.id)
        .map(dado => {
          const c = (dado.confiancaDepois ?? 100)
          const incerteza =  Math.pow(1 - c/100, 2); //TODO: Mudar isso para um modelo estatístico de verdade
  
          const valor = dado.valorDepois;
  
          const lower = Number((valor * (1 - incerteza)).toFixed(2));
          const upper = Number((valor * (1 + incerteza)).toFixed(2));

          return {
            x: dado.persistedAt?.toDate?.() || new Date(),
            valor,
            lower,
            upper,
            confianca: c,
          };
        })
        .sort((a, b) => a.x - b.x);
  
      // --- Área de incerteza (rangeArea) ---
      series.push({
        type: "rangeArea",
        name: `${entidade.nome} (Incerteza)`,
        data: dados.map(d => ({
          x: d.x,
          y: [d.lower, d.upper]
        })),
//        showInLegend: false,
      });
  
      // --- Linha central (valor) ---
      series.push({
        type: "line",
        name: `${entidade.nome}`,
        data: dados.map(d => ({
          x: d.x,
          y: d.valor,
          confianca: d.confianca,
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

  fill: {
    opacity: [0.25, 1]   // área transparente, linha sólida
  },

  stroke: {
    curve: "smooth",
    width: [0, 2]       // área sem stroke, linha destacada
  },

  xaxis: {
    type: "datetime"
  },

  markers: {
    size: 4,
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
            ${caracteristica.nome}: 
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


  if (loading) return <Loading />;
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

export default HistoricoTab;