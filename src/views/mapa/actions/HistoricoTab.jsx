import { useEffect, useState } from "react";
import { Form, Card, Table, Spinner } from "react-bootstrap";
import ApexCharts from "react-apexcharts";
import { db } from "../../../firebase";
import { catalogosService } from "../../../services/catalogosService";
import { eventosService } from "../../../services/crud/eventosService";
import { historicoEfeitosService } from "../../../services/crud/historicoEfeitosService";
// import { eventosService } from "../../services/crud/eventosService";

const HistoricoTab = ({ entidade, tipoEntidade, showToast }) => {
  const [caracteristicas, setCaracteristicas] = useState([]);     // catálogo de características
  const [seriesDisponiveis, setSeriesDisponiveis] = useState([]); // todas as séries históricas disponíveis
  const [serieSelecionada, setSerieSelecionada] = useState(null); // única
  const [eventos, setEventos] = useState([]);
  const [efeitos, setEfeitos] = useState([]);
  const [reading, setLoading] = useState(true);

  // =========== CARREGAR DADOS ===========
  useEffect(() => {
    if (!entidade?.id) return;

    setLoading(true);

    // ----- EVENTOS -----
    const unsubEventos = eventosService.subscribe(
      (data) => {
        setEventos(data);
      },
      [{ field: "entidadeId", op: "==", value: entidade.id }],
      { field: "createdAt", direction: "desc" }
    );

    // ----- HISTÓRICO DE EFEITOS -----
    const unsubEfeitos = historicoEfeitosService.subscribe(
      (data) => {
        // características únicas
        const caracteristicasDisponiveis = Array.from(
          new Set(data.map(e => e.caracteristicaId))
        );
        setEfeitos(data);
        setSeriesDisponiveis(caracteristicasDisponiveis);

        // mantém seleção válida (não reseta escolha do usuário)
        setSerieSelecionada(prev => {
          if (!prev) return caracteristicasDisponiveis[0] || null;
          return caracteristicasDisponiveis.includes(prev)
            ? prev
            : (caracteristicasDisponiveis[0] || null);
        });

        setLoading(false);
      },
      [{ field: "entidadeId", op: "==", value: entidade.id }],
      { field: "createdAt", direction: "desc" }
    );

    return () => {
      unsubEventos();
      unsubEfeitos();
    };
  }, [entidade?.id]);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
  
    Promise.all([
      catalogosService.getCaracteristicas(),
    ]).then(([carac, ]) => {
      if (!ativo) return;
  
      setCaracteristicas(carac);
      setLoading(false);
    });
  
    return () => { ativo = false };
  }, []);


  // ========== MONTAR SERIES ==========
  const series = [];

  if (serieSelecionada) {
    const dados = efeitos
      .filter(ef => ef.caracteristicaId === serieSelecionada)
      .map(dado => {
        const c = (dado.confiancaDepois ?? 100)
        const incerteza =  Math.pow(1 - c/100, 2); //TODO: Mudar isso para um modelo estatístico de verdade

        const valor = dado.valorDepois;

        const lower = Number((valor * (1 - incerteza)).toFixed(2));
        const upper = Number((valor * (1 + incerteza)).toFixed(2));

        return {
          x: dado.createdAt?.toDate?.() || new Date(),
          valor,
          lower,
          upper,
          confianca: c,
        };
      })
      .sort((a, b) => a.x - b.x);

    const nome =
      caracteristicas.find(c => c.id === serieSelecionada)?.nome
      || serieSelecionada;

    // --- Área de incerteza (rangeArea) ---
    series.push({
      type: "rangeArea",
      name: `${nome} — Incerteza`,
      data: dados.map(d => ({
        x: d.x,
        y: [d.lower, d.upper]
      }))
    });

    // --- Linha central (valor) ---
    series.push({
      type: "line",
      name: `${nome} — Valor`,
      data: dados.map(d => ({
        x: d.x,
        y: d.valor,
        confianca: d.confianca,
      }))
    });
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
    hover: {
      sizeOffset: 5
    }
  },

  legend: {
    show: true,
    inverseOrder: true
  },

  tooltip: {
    shared: true,
    intersect: false,
    custom: ({ seriesIndex, dataPointIndex, w }) => {
    const pontoLinha = w.globals.initialSeries[1]?.data[dataPointIndex];

    if (!pontoLinha) return "";

    const valor = w.globals.series[1]?.[dataPointIndex];
    const confianca = pontoLinha.confianca ?? "-";

    return `
      <div style="padding:8px">
        <strong>${w.globals.seriesNames[1] || "Valor"}</strong><br/>
        Valor: <b>${Number(valor).toFixed(2)}</b><br/>
        Confiança: <b>${confianca}%</b><br/>
      </div>
    `;
    }
  }
};


// ------------------- HANDLER SELEÇÃO -------------------
  const toggleCaracteristica = (carac) => {
    setSeriesSelecao(prev =>
      prev.includes(carac)
        ? prev.filter(c => c !== carac)
        : [...prev, carac]
    );
  };

  if (reading) return <Spinner animation="border" />;
  return (
    <div>
      {/* ----- Seleção de Características ----- */}
      <Card className="mb-3 p-2">
        <Form>
          <Form.Group>
            <Form.Label>Característica</Form.Label>
            <Form.Select
              value={serieSelecionada || ""}
              onChange={(e) => setSerieSelecionada(e.target.value)}
            >
              <option value="" disabled>Selecione uma característica</option>

              {seriesDisponiveis.map(serieId => (
                <option key={serieId} value={serieId}>
                  {caracteristicas.find(c => c.id === serieId)?.nome || serieId}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Card>

      {/* ----- Gráfico ----- */}
      <Card className="mb-3 p-2">
        <ApexCharts options={options} series={series} type="rangeArea" height={350} />
      </Card>

      {/* ----- Lista de Eventos ----- */}
      <Card className="p-2">
        <h5>Eventos</h5>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Tipo</th>
                {serieSelecionada && (
                  <th>
                    {caracteristicas.find(c => c.id === serieSelecionada)?.nome || serieSelecionada}
                  </th>
                )}
            </tr>
          </thead>
          <tbody>
            {eventos.map(ev => (
              <tr key={ev.id}>
                <td>{ev.createdAt.toDate().toLocaleString()}</td>
                <td>{ev.acaoTipo}</td>
                  {serieSelecionada && (() => {
                    const efeito = efeitos.find(
                      e => e.eventoId === ev.id && e.caracteristicaId === serieSelecionada
                    );
                    return <td>{efeito ? efeito?.deltaValor?.toFixed(2) : "-"}</td>;
                  })()}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default HistoricoTab;
