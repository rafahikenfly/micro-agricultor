import { useEffect, useState } from "react";
import { Form, Button, InputGroup, Tabs, Tab, FormLabel, FormGroup } from "react-bootstrap";
import ListaAcoes from "../common/ListaAcoes";

export default function VariedadesEstagioTab({
  value = {caracteristicas: {}, parametros: {}},
  index = null,
  onChange,
  caracteristicas = [],
  parametros = [],
}) {
  const [parametroId, setParametroId] = useState("");
  const [parametroMin, setParametroMin] = useState(0);
  const [parametroMax, setParametroMax] = useState(0);

  const [caracteristicaId, setCaracteristicaId] = useState("");
  const [caracteristicaMin, setCaracteristicaMin] = useState(0);
  const [caracteristicaMax, setCaracteristicaMax] = useState(0);

  const CaracteristicasEstagio = () => {
    const atualizarCaracteristicas = () => {
      const novosCaracteristicas = {...value.caracteristicas, [caracteristicaId]: {
          caracteristicaId,
          caracteristicaNome: caracteristicas.find(p => p.id === caracteristicaId ).nome,
          caracteristicaMin,
          caracteristicaMax,
        }
      }
      onChange({...value, caracteristicas: novosCaracteristicas}, index)
    };
  
    const removerCaracteristica = (data) => {
      const {[data.caracteristicaId]: removed, ...novosCaracteristicas} = value.caracteristicas;
      onChange({...value, caracteristicas: novosCaracteristicas}, index);
    }

    return (
      <>
        <>
      {/* Inserção */}
      <InputGroup >
        <FormGroup>
          <FormLabel>Parâmetro</FormLabel>
          <Form.Select
              value={caracteristicaId}
              onChange={e => setCaracteristicaId(e.target.value)}
              required
          >
            <option value="">Selecione</option>
            {caracteristicas.map(p => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Form.Select>
        </FormGroup>
        <FormGroup>
          <FormLabel>Mínimo</FormLabel>
          <Form.Control
            value={caracteristicaMin}
            onChange={e => setCaracteristicaMin(Number(e.target.value))}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Máximo</FormLabel>
          <Form.Control
            value={caracteristicaMax}
            onChange={e => setCaracteristicaMax(Number(e.target.value))}
          />
        </FormGroup>
      </InputGroup>

      <Button onClick={atualizarCaracteristicas}>
        Adicionar característica
      </Button>

      {/* LISTA */}
      <ListaAcoes
        dados={Object.values(value.caracteristicas)}
        campos={[
          {rotulo: "Característica", data: "caracteristicaNome"},
          {rotulo: "Mínimo", data: "caracteristicaMin"},
          {rotulo: "Máximo", data: "caracteristicaMax"},
        ]}
        acoes={[
          {rotulo: "Excluir", funcao: removerCaracteristica, variant: "danger"},
        ]}
      />
    </>
      </>
    )  }

  const ParametrosEstagio = () => {
    const atualizarParametros = () => {
      const novosParametros = {...value.parametros, [parametroId]: {
          parametroId,
          parametroNome: parametros.find(p => p.id === parametroId ).nome,
          parametroMin,
          parametroMax,
        }
      }
      onChange({...value, parametros: novosParametros}, index)
    };
  
    const removerParametro = (data) => {
      const {[data.parametroId]: removed, ...novosParametros} = value.parametros;
      onChange({...value, parametros: novosParametros}, index);
    }

    return (
      <>
        <>
      {/* Inserção */}
      <InputGroup >
        <FormGroup>
          <FormLabel>Parâmetro</FormLabel>
          <Form.Select
              value={parametroId}
              onChange={e => setParametroId(e.target.value)}
              required
          >
            <option value="">Selecione</option>
            {parametros.map(p => (
              <option key={p.id} value={p.id}>
                {p.rotulo}
              </option>
            ))}
          </Form.Select>
        </FormGroup>
        <FormGroup>
          <FormLabel>Mínimo</FormLabel>
          <Form.Control
            value={parametroMin}
            onChange={e => setParametroMin(Number(e.target.value))}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Máximo</FormLabel>
          <Form.Control
            value={parametroMax}
            onChange={e => setParametroMax(Number(e.target.value))}
          />
        </FormGroup>
      </InputGroup>

      <Button onClick={atualizarParametros}>
        Adicionar parâmetro
      </Button>

      {/* LISTA */}
      <ListaAcoes
        dados={Object.values(value.parametros)}
        campos={[
          {rotulo: "Parâmetro", data: "parametroNome"},
          {rotulo: "Mínimo", data: "parametroMin"},
          {rotulo: "Máximo", data: "parametroMax"},
        ]}
        acoes={[
          {rotulo: "Excluir", funcao: removerParametro, variant: "danger"},
        ]}
      />
    </>
      </>
    )
  }

  return (
    <Tabs defaultActiveKey="caracteristicas">
      <Tab eventKey="caracteristicas" title="Características">
        <CaracteristicasEstagio caracteristicas={value.caracteristicas}/>
      </Tab>

      <Tab eventKey="parametros" title="Parâmetros">
        <ParametrosEstagio />
      </Tab>
    </Tabs>
  );
}
