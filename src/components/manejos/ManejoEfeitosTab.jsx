import { useEffect, useState } from "react";
import { Form, Button, InputGroup, Row, Col } from "react-bootstrap";
import ListaAcoes from "../common/ListaAcoes";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";
import { TIPOS_EFEITO } from "../../utils/consts/TIPOS_EFEITO";
import InputGroupText from "react-bootstrap/esm/InputGroupText";

export default function ManejoEfeitosTab({
  efeitos = [],
  caracteristicas,
  onChange,
  loading,
}) {
  const [caracteristica, setCaracteristica] = useState("");
  const [tipoEfeito, setTipoEfeito] = useState("");
  const [valorEfeito, setValorEfeito] = useState(0);
  const [valorConfianca, setValorConfianca] = useState(0);

  const adicionarEfeito = () => {
    const novoEfeito = {
      caracteristicaId: caracteristica.id,
      caracteristicaNome: caracteristica.nome,
      tipoEfeitoId: tipoEfeito.id,
      tipoEfeitoNome: tipoEfeito.nome,
      valorEfeito: valorEfeito,
      valorConfianca: valorConfianca,
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
    {/* FORM */}
      <InputGroup className="mb-3 align-items-center">
        <InputGroupText>Característica Alterada</InputGroupText>
        <Form.Select
          value={caracteristica.id}
          onChange={e => 
            setCaracteristica(caracteristicas.find(c => c.id === e.target.value))
          }
          required
        >
          {renderOptions({
            list: caracteristicas,
            loading,
            placeholder: "Selecione a característica afetada",
          })}
        </Form.Select>
      </InputGroup>

      <Row className="g-2 align-items-end">
      <InputGroup className="mb-3">
        <InputGroupText>Efeito</InputGroupText>

        {/* Tipo */}
        <Col md={3}>
          <Form.Group>
            <Form.Label className="text-center w-100">Tipo</Form.Label>
            <Form.Select
              value={tipoEfeito.id}
              onChange={e => handleSelectIdNome(e, {
                list: TIPOS_EFEITO,
                setForm: setTipoEfeito,
                fieldId: "id",
                fieldNome: "nome",
              })}
              required
            >
              {renderOptions({
                list: TIPOS_EFEITO,
                loading,
                placeholder: "Selecione o tipo de efeito",
              })}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Efeito */}
        <Col md={3}>
          <Form.Group>
            <Form.Label className="text-center w-100">Efeito</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                step="0.01"
                value={valorEfeito}
                onChange={e => setValorEfeito(Number(e.target.value) || 0)}
                placeholder="Valor"
                required
              />
              {caracteristica?.unidade && (
                <InputGroupText>{caracteristica.unidade}</InputGroupText>
              )}
            </InputGroup>
          </Form.Group>
        </Col>

        {/* Confiança */}
        <Col md={2}>
          <Form.Group>
            <Form.Label className="text-center w-100">Confiança</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                step="any"
                value={valorConfianca || 0}
                onChange={e => setValorConfianca(e.target.value)}
                placeholder="Valor Confiança"
                required
              />
              <InputGroupText>%</InputGroupText>
            </InputGroup>
          </Form.Group>
        </Col>

        {/* Botão */}
        <Col md={2} className="d-flex">
          <Button variant="outline-success" className="w-100 align-self-end" onClick={adicionarEfeito}>
            Adicionar
          </Button>
        </Col>
      </InputGroup>
      </Row>

    {/* LISTA */}
      <ListaAcoes
        dados={Object.values(efeitos)}
        colunas={[
          {rotulo: "Característica", dataKey: "caracteristicaNome"},
          {rotulo: "Tipo Efeito", dataKey: "tipoEfeitoNome"},
          {rotulo: "Valor", dataKey: "valorEfeito"},
          {rotulo: "Confiança", dataKey: "valorConfianca"},
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