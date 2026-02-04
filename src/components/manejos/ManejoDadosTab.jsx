import { Form, InputGroup, } from "react-bootstrap";
import { TIPOS_ENTIDADE } from "../../utils/consts/TIPOS_ENTIDADE";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";

export default function ManejoDadosTab({ form, setForm, estados_canteiro, estados_planta, loading}) {
  return (
    <>
      <InputGroup className="mb-3">
        <InputGroup.Text style={{ width: "140px" }}>Nome</InputGroup.Text>
        <Form.Control
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text style={{ width: "140px" }}>Descrição</InputGroup.Text>
        <Form.Control
          as="textarea"
          value={form.descricao}
          onChange={e => setForm({ ...form, descricao: e.target.value })}
        />
      </InputGroup>

     {/* ===== Tipo de Entidade (novo padrão) ===== */}
      <InputGroup className="mb-3">
        <InputGroup.Text style={{ width: "140px" }}>Aplicável a</InputGroup.Text>
        <Form.Select
          value={form.tipoEntidade}
          onChange={e => setForm({ ...form, tipoEntidade: e.target.value })}
        >
          {renderOptions({
            list: TIPOS_ENTIDADE,
            loading: false,
            placeholder: "Selecione a entidade",
          })}
        </Form.Select>
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text style={{ width: "140px" }}>Estado</InputGroup.Text>
        <Form.Select
          disabled={(form.tipoEntidade) === "Horta"}
          value={form.estadoOrigemId}
          onChange={e => handleSelectIdNome(e,{
            list:
              form.tipoEntidade === "Canteiro" ? estados_canteiro : 
              form.tipoEntidade === "Planta" ? estados_planta : 
              [],
            setForm: setForm,
            fieldId: "estadoOrigemId",
            fieldNome: "estadoOrigemNome",
          })}
        >
          {renderOptions({
            list: 
              form.tipoEntidade === "Canteiro" ? estados_canteiro : 
              form.tipoEntidade === "Planta" ? estados_planta : 
              [],
            loading,
            placeholder: "Nenhum estado de origem",
            nullOption: true,
          })}
        </Form.Select>
        <Form.Select
          disabled={(form.tipoEntidade) === "Horta"}
          value={form.estadoDestinoId}
          onChange={e => handleSelectIdNome(e,{
            list:
              form.tipoEntidade === "Canteiro" ? estados_canteiro : 
              form.tipoEntidade === "Planta" ? estados_planta : 
              [],
            setForm: setForm,
            fieldId: "estadoDestinoId",
            fieldNome: "estadoDestinoNome",
          })}
        >
          {renderOptions({
            list:
              form.tipoEntidade === "Canteiro" ? estados_canteiro :
              form.tipoEntidade === "Planta" ? estados_planta :
              [],
            loading,
            placeholder: "Nenhum estado de destino",
            nullOption: true,
          })}
        </Form.Select>
      </InputGroup>
    </>
  );
}

/**
      <Form.Check
        label="Requer Entrada"
        checked={form.requerEntrada}
        onChange={e =>
          setForm({ ...form, requerEntrada: e.target.checked })
        }
      />
      */
