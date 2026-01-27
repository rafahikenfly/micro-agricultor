import { useEffect, useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import ListaAcoes from "../common/ListaAcoes";

export default function EspecieEstagiosTab({
  value = [],
  estagios = [],
  onChange,
}) {
  const [estagioId, setEstadoId] = useState("");

  const adicionar = () => {
    const newValue = [...value, {
      estagioId: estagioId,
      estagioNome: estagios.find(e => e.id === estagioId ).nome,
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
          value={estagioId}
          onChange={e => setEstadoId(e.target.value)}
          required
        >
          <option value="">Selecione o estágio</option>
          {estagios.map(e => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </Form.Select>
      </InputGroup>

      <Button onClick={adicionar}>
        Adicionar estágio ao ciclo
      </Button>

      {/* LISTA */}
      <ListaAcoes
        dados={Object.values(value)}
        campos={[
          {rotulo: "Estágio", data: "estagioNome"},
        ]}
        acoes={[
          {rotulo: "Excluir", funcao: remover, variant: "danger"},
        ]}
      />
    </>
  );
}
