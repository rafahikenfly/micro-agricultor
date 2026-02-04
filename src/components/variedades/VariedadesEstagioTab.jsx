import { useEffect, useState } from "react";
import { Form, Button, InputGroup, Tabs, Tab, FormLabel, FormGroup } from "react-bootstrap";
import ListaAcoes from "../common/ListaAcoes";
import InputGroupText from "react-bootstrap/esm/InputGroupText";

export default function VariedadesEstagioTab({
    value = {caracteristicas: [], dimensao: {}},
    index = null,
    onChange,
    caracteristicas = [],
  }) {

  const [caracteristicaId, setCaracteristicaId] = useState("");
  const [caracteristicaMin, setCaracteristicaMin] = useState(0);
  const [caracteristicaMax, setCaracteristicaMax] = useState(0);

  const CaracteristicasPlanta = () => {
    const atualizarCaracteristicas = () => {
      const novaCaracteristica = {...value.caracteristicas, [caracteristicaId]: {
          caracteristicaId,
          caracteristicaNome: caracteristicas.find(p => p.id === caracteristicaId ).nome,
          caracteristicaMin,
          caracteristicaMax,
        }
      }
      onChange({...value, caracteristicas: novaCaracteristica}, index)
    };
  
    const removerCaracteristica = (data) => {
      const {[data.caracteristicaId]: removed, ...novoObjCaracteristicas} = value.caracteristicas;
      onChange({...value, caracteristicas: novoObjCaracteristicas}, index);
    }

    return (
      <>
      {/* Inserção */}
      <InputGroup >
        <FormGroup>
          <FormLabel>Características da Planta</FormLabel>
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
          <FormLabel>Início do Estágio</FormLabel>
          <Form.Control
            value={caracteristicaMin}
            onChange={e => setCaracteristicaMin(Number(e.target.value))}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Fim do Estágio</FormLabel>
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
    ) 
  }


        /**
        const CaracteristicasCanteiro = () => {
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
        }
          return (
            <>
              <>
            {/* Inserção }
            <InputGroup >
              <FormGroup>
                <FormLabel>Característica</FormLabel>
                <Form.Select
                    value={parametroId}
                    onChange={e => setCaracteristicaId(e.target.value)}
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
                  onChange={e => setCaracteristicaMin(Number(e.target.value))}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Máximo</FormLabel>
                <Form.Control
                  value={parametroMax}
                  onChange={e => setCaracteristicaMax(Number(e.target.value))}
                />
              </FormGroup>
            </InputGroup>

            <Button onClick={atualizarCaracteristicas}>
              Adicionar Característica
            </Button>

            {/* LISTA }
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
        */
  return (
    <>
      <InputGroup>
        <InputGroupText>Dimensão X</InputGroupText>
        <Form.Control
          value={value.dimensao.x}
          onChange={(e)=>onChange({...value, dimensao: {...value.dimensao, x: Number(e.target.value)}}, index)}
          placeholder="X"
        />
        <Form.Control
          value={value.dimensao.y}
          onChange={(e)=>onChange({...value, dimensao: {...value.dimensao, y: Number(e.target.value)}}, index)}
          placeholder="Y"
        />
        <Form.Control
          value={value.dimensao.z}
          onChange={(e)=>onChange({...value, dimensao: {...value.dimensao, z: Number(e.target.value)}}, index)}
          placeholder="Z"
        />
        <InputGroupText>(cm)</InputGroupText>
      </InputGroup>

      <Tabs defaultActiveKey="caracteristicas">
        <Tab eventKey="caracteristicas" title="Características">
          <CaracteristicasPlanta caracteristicas={value.caracteristicas}/>
        </Tab>
        {/**
        <Tab eventKey="parametros" title="Parâmetros">
          <CaracteristicasCanteiro />
        </Tab>
        */}
      </Tabs>
    </>
  );
}
