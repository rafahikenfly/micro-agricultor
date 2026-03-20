import { Form, InputGroup } from "react-bootstrap";

export default function CvJobRunResultadoTab({ form, setForm }) {
  const { resultados, encaminhamento } = form;

  return (
    <>
      {/* ===== RESULTADOS ===== */}
      <InputGroup className="mb-3">
        <InputGroup.Text>Modelo ID</InputGroup.Text>
        <Form.Control
          value={resultados.modeloId}
          onChange={e =>
            setForm({ resultados: { ...resultados, modeloId: e.target.value } })
          }
        />

        <InputGroup.Text>Versão</InputGroup.Text>
        <Form.Control
          value={resultados.modeloVersao}
          onChange={e =>
            setForm({ resultados: { ...resultados, modeloVersao: e.target.value } })
          }
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text>Média Confiança</InputGroup.Text>
        <Form.Control
          type="number"
          value={resultados.mediaConfianca}
          onChange={e =>
            setForm({ resultados: { ...resultados, mediaConfianca: e.target.value } })
          }
        />

        <InputGroup.Text>Detecções</InputGroup.Text>
        <Form.Control
          type="number"
          value={resultados.numDeteccoes}
          onChange={e =>
            setForm({ resultados: { ...resultados, numDeteccoes: e.target.value } })
          }
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text>Path Resultados</InputGroup.Text>
        <Form.Control
          value={resultados.pathResultados}
          onChange={e =>
            setForm({ resultados: { ...resultados, pathResultados: e.target.value } })
          }
        />
      </InputGroup>

      {/* ===== ENCAMINHAMENTO ===== */}
      <InputGroup className="mb-3">
        <InputGroup.Text>Decisão</InputGroup.Text>
        <Form.Control
          value={encaminhamento.decisao ?? ""}
          onChange={e =>
            setForm({
              encaminhamento: { ...encaminhamento, decisao: e.target.value },
            })
          }
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text>Motivo</InputGroup.Text>
        <Form.Control
          value={encaminhamento.motivo ?? ""}
          onChange={e =>
            setForm({
              encaminhamento: { ...encaminhamento, motivo: e.target.value },
            })
          }
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text>Path Encaminhamento</InputGroup.Text>
        <Form.Control
          value={encaminhamento.pathEncaminhamento}
          onChange={e =>
            setForm({
              encaminhamento: {
                ...encaminhamento,
                pathEncaminhamento: e.target.value,
              },
            })
          }
        />
      </InputGroup>
    </>
  );
}
