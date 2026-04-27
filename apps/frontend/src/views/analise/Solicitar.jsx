import { Button, Col, Container, Form, Row } from "react-bootstrap"
import { renderOptions, StandardCard, StandardInput } from "../../utils/formUtils";
import { useCache } from "../../hooks/useCache";
import { useState } from "react";
import { toDateTimeLocal } from "../../utils/dateUtils";
import { relatoriosService } from "../../services/crudService";
import { validarRelatorio } from "micro-agricultor/domain/relatorios.rules";
import { useAuth } from "../../services/auth/authContext";

export default function Solicitar ({}) {
  const { user } = useAuth();
  const { cacheCaracteristicas, cachePlantas, cacheCanteiros, reading } = useCache(["caracteristicas", "plantas", "canteiros"])

  const [form, setForm] = useState({
    contexto: {
      caracteristicasId: [],
      plantasId: [],
      canteirosId: [],
    },
    inicio: Date.now(),
    fim: Date.now(),
  });

  const setContexto = (contexto) => setForm({...form, contexto})

  const handleMultiSelect = (e, setter) => {
    const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setter(values);
  };

  const handleSubmit = () => {
    const novoRelatorio = validarRelatorio(form)
    relatoriosService.create(novoRelatorio, user)
  }

  return (
    <Container fluid>
      <StandardCard header="Contexto">
        <StandardInput label="Características">
            <Form.Select
              multiple
              onChange={(e) => handleMultiSelect(e, (caracteristicasId)=>setContexto({...form.contexto, caracteristicasId}))}
            >
            
              {renderOptions({
                list: cacheCaracteristicas?.list,
                placeholder: "Selecione as características para relatório",
                loading: reading,
              })}
            </Form.Select>
          </StandardInput>
          <StandardInput label="Plantas">
            <Form.Select
              multiple
              onChange={(e) => handleMultiSelect(e, (plantasId)=>setContexto({...form.contexto, plantasId}))}
            >
            
              {renderOptions({
                list: cachePlantas?.list,
                placeholder: "Selecione as plantas para relatório",
                loading: reading,
              })}
            </Form.Select>
          </StandardInput>
          <StandardInput label="Canteiros">
            <Form.Select
              multiple
              onChange={(e) => handleMultiSelect(e, (canteirosId)=>setContexto({...form.contexto, canteirosId}))}
            >
            
              {renderOptions({
                list: cacheCanteiros?.list,
                placeholder: "Selecione os canteiros para relatório",
                loading: reading,
              })}
            </Form.Select>
          </StandardInput>
        </StandardCard>
        <StandardCard header="Intervalo">
        <Row className="mb-3"><Col>
            <StandardInput label="Início" width="120px">
              <Form.Control
                type="datetime-local"
                value={toDateTimeLocal(new Date(form.inicio))}
                onChange={(e)=> setForm({...form, inicio: new Date(e.target.value).getTime()})}
              />
            </StandardInput>
          </Col>
          <Col>
            <StandardInput label="Fim" width="120px">
              <Form.Control
                type="datetime-local"
                value={toDateTimeLocal(new Date(form.fim))}
                onChange={(e)=> setForm({...form, fim: new Date(e.target.value).getTime()})}
              />
            </StandardInput>
          </Col></Row>
        </StandardCard>

        <Button onClick={handleSubmit}>
          Solicitar
        </Button>
    </Container>
  )
}