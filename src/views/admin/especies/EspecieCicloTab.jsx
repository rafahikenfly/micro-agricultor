import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import ListaAcoes from "../../../components/common/ListaAcoes";
import { handleSelectIdNome, renderOptions, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils";

//TODO: USAR STANDARDINPUT
export default function EspecieCicloTab({
  ciclo = [],
  setCiclo,
  estagios = [],
  loading,
}) {
  const [estagio, setEstagio] = useState({});
  const [plantavel, setPlantavel] = useState("");
  const [colhivel, setColhivel] = useState("");
  const [instrucoes, setInstrucoes] = useState("");

  const adicionar = () => {
    const novoEstagio = [...ciclo, {
      estagioId: estagio.id,
      estagioNome: estagio.nome,
      plantavel: plantavel,
      colhivel: colhivel,
      instrucoes: instrucoes,
    }];
    setEstagio("");
    setPlantavel("");
    setColhivel("");
    setInstrucoes("");
    setCiclo(novoEstagio)
  };

  const removerEstagio =  (data, idx) => {
    const novoArray = [...ciclo];
    novoArray.splice(idx, 1)
    setCiclo(novoArray)
  }

  const moverEstagioParaCima = (data, idx) => {
    if (idx <= 0) return;

    const novoArray = [...ciclo];
    [novoArray[idx - 1], novoArray[idx]] =
      [novoArray[idx], novoArray[idx - 1]];
  
    setCiclo(novoArray);
  };

  const moverEstagioParaBaixo = (data, idx) => {
    if (idx >= ciclo.length - 1) return;
  
    const novoArray = [...ciclo];
    [novoArray[idx], novoArray[idx + 1]] =
      [novoArray[idx + 1], novoArray[idx]];
  
    setCiclo(novoArray);
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
      <StandardInput label="Inserir estágio">
        <Form.Select
          value={estagio.id ?? ""}
          onChange={e => handleSelectIdNome(e,{
            list: estagios,
            setForm: setEstagio,
            fieldId: "id",
            fieldNome: "nome",
          })}
        >
        {renderOptions({
          list: estagios,
          loading: loading,
          placeholder: "Selecione o estágio",
          nullOption: true,
        })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Instruções">
        <Form.Control
          as="textarea"
          rows={3}
          value={instrucoes}
          onChange={(e) => setInstrucoes(e.target.value)}
        />
      </StandardInput>
      <StandardCheckboxGroup label="Propriedades">
        <Form.Check 
          checked={plantavel}
          label="Plantável"
          onChange={e => setPlantavel(e.target.checked)}
        />
        <Form.Check 
          checked={colhivel}
          label="Colhível"
          onChange={e => setColhivel(e.target.checked)}
        />
      </StandardCheckboxGroup>
      <Button onClick={adicionar}>
        Adicionar estágio ao ciclo
      </Button>

      {/* LISTA */}
      <ListaAcoes
        dados={Object.values(ciclo)}
        colunas={[
          {rotulo: "Estágio", dataKey: "estagioNome"},
          {rotulo: "Plantável?", dataKey: "plantavel", boolean: true},
          {rotulo: "Colhível?", dataKey: "colhivel", boolean: true},
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
