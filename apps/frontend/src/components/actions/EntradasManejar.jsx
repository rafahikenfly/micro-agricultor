export function EntradasManejar({ entradas, values, onChange }) {
    return (
      <>
        {entradas.map((e) => (
          <Form.Group className="mb-2" key={e.key}>
            <Form.Label>
              {e.label} {e.unidade && `(${e.unidade})`}
            </Form.Label>
  
            <Form.Control
              type={e.tipo}
              required={e.obrigatorio}
              min={e.min}
              value={values[e.key] ?? ""}
              onChange={(e) => onChange(e.key, e.target.value)}
            />
          </Form.Group>
        ))}
      </>
    );
  }
  