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
    const novoEstagio = [...value, {
      estagioId: estagio.id,
      estagioNome: estagio.nome,
      plantavel: plantavel,
      instrucoes: instrucoes,
    }];
    onChange(novoEstagio)
  };

  const removerEstagio =  (data, idx) => {
    const novoArray = [...value];
    novoArray.splice(idx, 1)
    onChange(novoArray)
  }

  const moverEstagioParaCima = (data, idx) => {
    if (idx <= 0) return;

    const novoArray = [...value];
    [novoArray[idx - 1], novoArray[idx]] =
      [novoArray[idx], novoArray[idx - 1]];
  
    onChange(novoArray);
  };

  const moverEstagioParaBaixo = (data, idx) => {
    if (idx >= value.length - 1) return;
  
    const novoArray = [...value];
    [novoArray[idx], novoArray[idx + 1]] =
      [novoArray[idx + 1], novoArray[idx]];
  
    onChange(novoArray);
  };

  const duplicarEstagio = (data, idx) => {
    console.log(data)
    setEstagio(estagios.find(e => e.id === data.estagioId));
    setPlantavel(data.plantavel);
    setInstrucoes(data.instrucoes);
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
          checked={plantavel}
          label="Plantável"
          onChange={e => setPlantavel(e.target.checked)}
        />
      </InputGroup>
      <InputGroup>
      <InputGroupText>Instruções de plantio</InputGroupText>
      <Form.Control
        as="textarea"
        rows={3}
        value={instrucoes}
        onChange={(e) => setInstrucoes(e.target.value)}
      />
      </InputGroup>

      <Button onClick={adicionar}>
        Adicionar estágio ao ciclo
      </Button>

      {/* LISTA */}
      <ListaAcoes
        dados={Object.values(value)}
        colunas={[
          {rotulo: "Estágio", dataKey: "estagioNome"},
          {rotulo: "Plantável?", dataKey: "plantavel", boolean: true},
          {rotulo: "Instruções", dataKey: "instrucoes"},
        ]}
        acoes={[
          {rotulo: "▲", funcao: moverEstagioParaCima, variant: "outline-warning"},
          {rotulo: "▼", funcao: moverEstagioParaBaixo, variant: "outline-warning"},
          {rotulo: "Duplicar", funcao: duplicarEstagio, variant: "outline-success"},
          {rotulo: "Excluir", funcao: removerEstagio, variant: "danger"},

        ]}
      />
    </>
  );
}
