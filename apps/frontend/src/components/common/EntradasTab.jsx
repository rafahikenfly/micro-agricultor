import { useEffect, useState } from "react";
import { InputGroup, Form, Button } from "react-bootstrap";
import ListaAcoes from "./ListaAcoes";

export default function EntradasTab({ value = [], onChange}) {
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("");
  const [tipo, setTipo] = useState(0);
  const [obrigatorio, setObrigatorio] = useState(1);


  const adicionar = () => {
    const newValue = [...value, { nome: nome, tipo: tipo, unidade: unidade, obrigatorio: obrigatorio }]; //TODO: virar FORM
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
        <Form.Control
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Nome"
        />
        <Form.Select
          value={tipo}
          onChange={e => setTipo(e.target.value)}
          >
          <option>Selecione</option>
          {/** o value aqui deve ser um tipo de entrada para ser renderizado no tab de entradas */}
          <option value="text">Texto</option>
          <option value="number">Número</option>
          <option value="boolean">Verdadeiro/Falso</option>
        </Form.Select>
        <Form.Control
          value={unidade}
          onChange={e => setUnidade(e.target.value)}
          placeholder="Unidade"
        />
        <Form.Check
          label="Obrigatório"
          checked={obrigatorio}
          onChange={e => setObrigatorio(Boolean(e.target.checked))
          }
        />
      </InputGroup>

      <Button onClick={adicionar}>
        Adicionar Entrada
      </Button>

      {/* LISTA */}
      <ListaAcoes
        dados={value}
        campos={[
          {rotulo: "Nome", data: "nome"},
          {rotulo: "Tipo", data: "tipo"},
          {rotulo: "Obrigatório", data: "obrigatorio", boolean: true},
        ]}
        acoes={[
          {rotulo: "Excluir", funcao: remover, variant: "danger"},
        ]}
      />
    </>
  );
}
  