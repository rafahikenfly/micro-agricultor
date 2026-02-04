import { useEffect, useState } from "react";
import { Form, Card, Table, Spinner } from "react-bootstrap";
import ApexCharts from "react-apexcharts";
import { db } from "../../firebase";
import { catalogosService } from "../../services/catalogosService";
// import { eventosService } from "../../services/crud/eventosService";

const HistoricoTab = ({ entidade, tipoEntidade, showToast }) => {
  const [caracteristicas, setCaracteristicas] = useState([]);     // catálogo de características
  const [seriesDisponiveis, setSeriesDisponiveis] = useState([]); // todas as séries históricas disponíveis
  const [seriesSelecao, setSeriesSelecao] = useState([]);         // séries históricas selecionadas para exibição
  const [eventos, setEventos] = useState([]);
  const [efeitos, setEfeitos] = useState([]);
  const [reading, setLoading] = useState(true);

  // =========== CARREGAR DADOS ===========
  //  useEffect(() => {
  //    const unsub = eventosService.subscribe(setEventos);
  //    return unsub;
  //  }, []);
  //  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar eventos da entidade
        const eventosSnap = await db
          .collection("eventos")
          .where("entidadeId", "==", entidade.id)
          .orderBy("createdAt", "desc")
          .get();
        const eventosData = eventosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Buscar efeitos relacionados aos eventos
        const efeitosSnap = await db
          .collection("historicoEfeitos")
          .where("entidadeId", "==", entidade.id)
          .orderBy("createdAt", "desc")
          .get();
        const efeitosData = efeitosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Extrair características únicas
        const caracteristicasDisponiveis = Array.from(new Set(efeitosData.map(e => e.caracteristicaId)));

        setEventos(eventosData);
        setEfeitos(efeitosData);
        setSeriesDisponiveis(caracteristicasDisponiveis); // séries disponíveis
        setSeriesSelecao(caracteristicasDisponiveis);     // inicialmente todas selecionadas
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        showToast("Erro ao buscar histórico.", "danger");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entidade]);

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
  const catalogoCaracteristicas = caracteristicas.filter(c => c.aplicavel?.[tipoEntidade] === true);

  const series = [];
  seriesSelecao.forEach(serieCaracteristica => {
    const dados = efeitos
      .filter((ef) => ef.caracteristicaId === serieCaracteristica)
      .map(dado => {
        return {
            x: dado.createdAt?.toDate?.() || new Date(),
            valor: dado.valorDepois,
            confianca: dado.confiancaDepois,
            caracteristicaNome: catalogoCaracteristicas.find(c => c.id === serieCaracteristica)?.nome || serieCaracteristica, 
        };
        })
      .sort((a, b) => a.x - b.x);
      
    const nome = caracteristicas.find((a)=>a.id === serieCaracteristica).nome;
    
      // Linha → valor
    series.push({
      name: nome,
      type: "line",
      data: dados.map(d => ({ x: d.x, y: d.valor }))
    });
    // Área → lower
    series.push({
      name: `${nome}(Confianca)`,
      type: "rangeArea",
      data: dados.map(d => ({ x: d.x, y: [d.valor * (1 - d.confianca/100), d.valor * (1 + d.confianca/100)] }))
    });
  });

  // ========== APEX OPTIONS ==========
  const options = {
    chart: {
      type: "line",
      stacked: false,
      toolbar: { show: true },
    },

    stroke: {
      width: [3, 1], // linha mais forte, área mais suave
      curve: "smooth"
    },

    fill: {
      type: ["solid", "gradient"],
      opacity: [1, 0.25], // área transparente
      gradient: {
        shadeIntensity: 0.3,
        opacityFrom: 0.35,
        opacityTo: 0.05,
      }
    },

    dataLabels: {
      enabled: false
    },

    xaxis: {
      type: "datetime"
    },

    yaxis: [
      {
        title: { text: "Valor" }
      },
      {
        opposite: true,
        max: 100,
        min: 0,
        title: { text: "Confiança (%)" }
      }
    ],

    tooltip: { //TODO: Arrumar esse tooltip
      shared: true,
      intersect: false,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const ponto = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        // retorna HTML customizado para o tooltip do ponto
        return `<div>
          <strong>${ponto.caracteristicaNome}<br/>
          ${ponto.y} <strong>em</strong> ${ponto.x.toLocaleDateString()}<br/>
          <strong>Confiança:</strong> ${ponto.confianca}<br/>
        </div>`;
      },
    },

    legend: {
      position: "top"
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
          {seriesDisponiveis.map(serieId => (
            <Form.Check
              inline
              key={serieId}
              label={catalogoCaracteristicas.find(c => c.id === serieId)?.nome || serieId}
              type="checkbox"
              checked={seriesSelecao.includes(serieId)}
              onChange={() => toggleCaracteristica(serieId)}
            />
          ))}
        </Form>
      </Card>

      {/* ----- Gráfico ----- */}
      <Card className="mb-3 p-2">
        <ApexCharts options={options} series={series} type="line" height={350} />
      </Card>

      {/* ----- Lista de Eventos ----- */}
      <Card className="p-2">
        <h5>Eventos</h5>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Tipo</th>
              {seriesSelecao.map(s => <th key={s}>{catalogoCaracteristicas.find(c => c.id === s)?.nome || s}</th>)}
            </tr>
          </thead>
          <tbody>
            {eventos.map(ev => (
              <tr key={ev.id}>
                <td>{ev.createdAt.toDate().toLocaleString()}</td>
                <td>{ev.acaoTipo}</td>
                {seriesSelecao.map(c => {
                  const efeito = efeitos.find(e => e.eventoId === ev.id && e.caracteristicaId === c);
                  return <td key={c}>{efeito ? efeito?.deltaValor?.toFixed(2) : "-"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default HistoricoTab;
