import { Form, FormGroup, InputGroup } from "react-bootstrap";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";

export default function VariedadeDadosTab({ form, setForm, especies, loading}) {
  return (
    <>
      <Form.Group>
        <Form.Select
          value={form.especieId}
          onChange={e => handleSelectIdNome(e,{
            list: especies,
            setForm: setForm,
          })}
        >
          {renderOptions({
            list: especies,
            loading,
            placeholder: "Selecione a espécie",
          })}
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label>Nome</Form.Label>
        <Form.Control
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Descrição</Form.Label>
        <Form.Control
          as="textarea"
          value={form.descricao}
          onChange={e => setForm({ ...form, descricao: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Espaçamento</Form.Label>
          <InputGroup>
            <FormGroup >
              <Form.Label>X</Form.Label>
              <Form.Control
                  value={form.espacamento.x}
                  onChange={e =>
                    setForm(prev => ({ ...prev, espacamento: {
                        ...prev.espacamento, x: Number(e.target.value)
                      }
                    }))
                  }
              />
            </FormGroup>
            <FormGroup>
              <Form.Label>Y</Form.Label>
              <Form.Control
                  value={form.espacamento.y}
                  onChange={e =>
                    setForm(prev => ({ ...prev, espacamento: {
                        ...prev.espacamento, y: Number(e.target.value)
                      }
                    }))
                  }
              />
            </FormGroup>
            <FormGroup>
              <Form.Label>Z</Form.Label>
              <Form.Control
                  value={form.espacamento.z}
                  onChange={e =>
                    setForm(prev => ({ ...prev, espacamento: {
                        ...prev.espacamento, z: Number(e.target.value)
                      }
                    }))
                  }
              />
            </FormGroup>
          </InputGroup>
      </Form.Group>
    </>
  );
}
