import { useEffect, useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import ListaAcoes from "../common/ListaAcoes";
import { renderOptions } from "../../utils/formUtils";

const tiposEfeito = [
  {id: "delta", nome: "Delta",},
  {id: "multiplicador", nome: "Multiplicador",},
  {id: "fixo", nome: "Valor Fixo",},
]

export default function ManejoEfeitosTab({
  efeitos = [],
  caracteristicas,
  onChange,
  loading,
}) {
  const [caracteristicaId, setParametroId] = useState("");
  const [tipoEfeitoId, setTipoEfeitoId] = useState("");
  const [valorEfeito, setValorEfeito] = useState(0);

  const adicionarEfeito = () => {
    const novoEfeito = {
      caracteristicaId: caracteristicaId,
      caracteristicaNome: caracteristicas.find(c => c.id === caracteristicaId ).nome,
      tipoEfeitoId: tipoEfeitoId,
      tipoEfeitoNome: tiposEfeito.find(ef => ef.id === tipoEfeitoId).nome,
      valorEfeito: valorEfeito,
    };
    onChange([...(efeitos ?? []), novoEfeito]);
  };

  const removerEfeito =  (data, idx) => {
    efeitos.splice(idx, 1)
    onChange(efeitos)
  }

  const moverEfeitoParaCima = (data, idx) => {
    if (idx <= 0) return;

    const novoArray = [...efeitos];
    [novoArray[idx - 1], novoArray[idx]] =
      [novoArray[idx], novoArray[idx - 1]];
  
    onChange(novoArray);
  };

  const moverEfeitoParaBaixo = (data, idx) => {
    if (idx >= efeitos.length - 1) return;
  
    const novoArray = [...efeitos];
    [novoArray[idx], novoArray[idx + 1]] =
      [novoArray[idx + 1], novoArray[idx]];
  
    onChange(novoArray);
  };  

  return (
    <>
      {/* Inserção */}
      <InputGroup >
        <Form.Select
            value={caracteristicaId}
            onChange={e => setParametroId(e.target.value)}
            required
        >
          {renderOptions({
            list: caracteristicas,
            loading,
            placeholder: "Selecione a característica afetada",
          })}
        </Form.Select>
        <Form.Select
          value={tipoEfeitoId}
          onChange={e => setTipoEfeitoId(e.target.value)}
          required
        >
          {renderOptions({
            list: tiposEfeito,
            loading,
            placeholder: "Selecione o tipo de efeito",
          })}
        </Form.Select>
        <Form.Control
          type="number"
          value={valorEfeito}
          onChange={e => setValorEfeito(Number(e.target.value))}
          placeholder="Valor"
          required
        />
      </InputGroup>

      <Button onClick={adicionarEfeito}>
        Adicionar efeito
      </Button>

      {/* LISTA */}
      <ListaAcoes
        dados={Object.values(efeitos)}
        campos={[
          {rotulo: "Característica", data: "caracteristicaNome"},
          {rotulo: "Tipo Efeito", data: "tipoEfeitoNome"},
          {rotulo: "Valor", data: "valorEfeito"},
        ]}
        acoes={[
          {rotulo: "▲", funcao: moverEfeitoParaCima, variant: "outline-warning"},
          {rotulo: "▼", funcao: moverEfeitoParaBaixo, variant: "outline-warning"},
          {rotulo: "Excluir", funcao: removerEfeito, variant: "danger"},
        ]}
      />
    </>
  );
}