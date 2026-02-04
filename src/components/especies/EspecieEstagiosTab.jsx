import { useEffect, useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import ListaAcoes from "../common/ListaAcoes";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";
import InputGroupText from "react-bootstrap/esm/InputGroupText";

export default function EspecieEstagiosTab({
  value = [],
  estagios = [],
  loading,
  onChange,
}) {
  const [estagio, setEstagio] = useState("");
  const [plantavel, setPlantavel] = useState("");
  const [instrucoes, setInstrucoes] = useState("");

  const adicionar = () => {
    const newValue = [...value, {
      estagioId: estagio.id,
      estagioNome: estagio.nome,
      plantavel: plantavel,
      instrucoes: instrucoes,
    }];
    onChange(newValue)
  };

  const remover =  (data, idx) => {
    value.splice(idx, 1)
    onChange(value)
  }

  return (
    <>
      {/* Inserção */}
      <InputGroup >
        <Form.Select
          value={estagio.id}
          onChange={e => handleSelectIdNome(e,{
            list: estagios,
            setForm: setEstagio,
            fieldId: "id",
            fieldNome: "nome",
          })}
          required
        >
        {renderOptions({
          list: estagios,
          loading: loading,
          placeholder: "Selecione o estágio"
        })}
        </Form.Select>

        <Form.Check 
          value={plantavel}
          label="Plantável"
          onChange={e => setPlantavel(e.target.checked)}
        />
      </InputGroup>
      <InputGroup>
      <InputGroupText>Instruções de plantio</InputGroupText>
      <Form.Control
        type="textarea"
        value={instrucoes}
        onchange={setInstrucoes}
      />
      </InputGroup>

      <Button onClick={adicionar}>
        Adicionar estágio ao ciclo
      </Button>

      {/* LISTA */}
      <ListaAcoes
        dados={Object.values(value)}
        campos={[
          {rotulo: "Estágio", data: "estagioNome"},
          {rotulo: "Plantável?", data: "plantavel", boolean: true},
        ]}
        acoes={[
          {rotulo: "Excluir", funcao: remover, variant: "danger"},
        ]}
      />
    </>
  );
}
