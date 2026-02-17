import { Form, FormGroup, InputGroup } from "react-bootstrap";
import { handleSelectWithRule, renderOptions } from "../../utils/formUtils";
import { alteraEspecieDaVariedade } from "@domain/variedades.rules";

export default function VariedadeDadosTab({ form, setForm, especies, loading}) {
  return (
    <>
      <Form.Group>
        <Form.Select
          value={form.especieId}
          onChange={e => handleSelectWithRule(e,{
            list: especies,
            setForm: setForm,
            regra: alteraEspecieDaVariedade,
            refEntityKey: "especie",
            targetEntityKey: "variedade",
          })}
        >
          {renderOptions({
            list: especies,
            loading,
            placeholder: "Selecione a espécie",
            isOptionDisabled: (a)=>(a?.ciclo || []).length === 0
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
                  value={form?.espacamento?.x || 0}
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
                  value={form?.espacamento?.y || 0}
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
                  value={form?.espacamento?.z || 0}
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
