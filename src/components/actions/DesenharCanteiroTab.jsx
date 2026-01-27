import { useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { db } from "../../firebase";

export default function DesenharCanteiroTab({ canteiro }) {
  const [variedades, setVariedades] = useState([]);
  const [variedadeSelecionada, setVariedadeSelecionada] = useState(null);
  const [entradaArray, setEntradaArray] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);


  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    return db.collection("variedades")
        .orderBy("nome")
        .onSnapshot(s =>
        setVariedades(s.docs.map(d => ({ id: d.id, ...d.data() })))
        );
  }, []);


  const selecionarVariedade = (variedade) => {
    const cols = Math.ceil(canteiro.dimensao.x / variedade.espacamento.x);
    const rows = Math.ceil(canteiro.dimensao.y / variedade.espacamento.y);
    const grid = [];

    for (let linha = 1; linha <= rows; linha++) {
        for (let coluna = 0; coluna < cols; coluna++) {
          const nome = `${linha}${String.fromCharCode(65 + coluna)}`;
    
          grid.push({
            nome,
          });
        }
    }

    setVariedadeSelecionada(variedade);
    setForm({});
    setEntradaArray(grid);
  };

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const desenharPlantas = async () => {
    setLoading(true);

    console.log("Desenhou",{
      canteiroId: canteiro.id,
      variedadeId: variedadeSelecionada.id,
      variedadeNome: variedadeSelecionada.nome,
      entradas: form,
      timestamp: Date.now(),
    });

    setLoading(false);
    setVariedadeSelecionada(null);
  };

  return (
    <div className="p-3"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Form.Group className="mb-3">
        <Form.Label>Variedade</Form.Label>
        <Form.Select
          value={variedadeSelecionada?.id ?? ""}
          onChange={(e) =>
            selecionarVariedade( variedades.find((m) => m.id === e.target.value) )
          }
        >
          <option value="">Selecione</option>
          {variedades.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {variedadeSelecionada && (
        <>
          <Alert variant="secondary">
            {variedadeSelecionada.descricao}
          </Alert>

          {variedadeSelecionada.nome}
          ({variedadeSelecionada.espacamento.x} X {variedadeSelecionada.espacamento.y})
          
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
            onClick={desenharPlantas}
          >
            Aplicar manejo
          </Button>
        </>
      )}
    </div>
  );
}
