import { useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { db } from "../../firebase";

export default function MonitorarCanteiroTab({ canteiro }) {
  const [parametros, setParametros] = useState([]);
  const [parametroSelecionado, setParametroSelecionado] = useState(null);
  const [entradaArray, setEntradaArray] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);


  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    return db.collection("parametros")
        .orderBy("nome")
        .onSnapshot(s =>
        setParametros(s.docs.map(d => ({ id: d.id, ...d.data() })))
        );
  }, []);


  const selecionarParametro = (parametro) => {
    const cols = Math.ceil(canteiro.dimensao.x / parametro.resolucao);
    const rows = Math.ceil(canteiro.dimensao.y / parametro.resolucao);
    const grid = [];

    for (let linha = 1; linha <= rows; linha++) {
        for (let coluna = 0; coluna < cols; coluna++) {
          const nome = `${linha}${String.fromCharCode(65 + coluna)}`;
    
          grid.push({
            nome,
            valor: canteiro.estimativa?.[parametro.id],
          });
        }
    }

    setParametroSelecionado(parametro);
    setForm({});
    setEntradaArray(grid);
  };

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const monitorarParametro = async () => {
    setLoading(true);

    console.log("Mediu",{
      canteiroId: canteiro.id,
      parametroId: parametroSelecionado.id,
      parametroNome: parametroSelecionado.nome,
      entradas: form,
      timestamp: Date.now(),
    });

    setLoading(false);
    setParametroSelecionado(null);
  };

  return (
    <div className="p-3"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Form.Group className="mb-3">
        <Form.Label>Parâmetro</Form.Label>
        <Form.Select
          value={parametroSelecionado?.id ?? ""}
          onChange={(e) =>
            selecionarParametro( parametros.find((m) => m.id === e.target.value) )
          }
        >
          <option value="">Selecione</option>
          {parametros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {parametroSelecionado && (
        <>
          <Alert variant="secondary">
            {parametroSelecionado.descricao}
          </Alert>

          {parametroSelecionado.nome}
          ({parametroSelecionado.unidade})
          
          {entradaArray.map((en) => (
            <Form.Group>
              <Form.Label>
                {en.nome}
              </Form.Label>
              <Form.Control
                type="number"
                value={form[en.nome]}
                onChange={(e) => onChange(en.nome, Number(e.target.value))}
              />
            </Form.Group>
          ))}

          <Button
            variant="success"
            className="mt-3 w-100"
            disabled={loading}
            onClick={monitorarParametro}
          >
            Aplicar manejo
          </Button>
        </>
      )}
    </div>
  );
}
