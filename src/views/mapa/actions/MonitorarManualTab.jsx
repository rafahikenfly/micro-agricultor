import { useEffect, useState } from "react";
import { Form, Button, InputGroup, Row, Card, } from "react-bootstrap";
import { catalogosService } from "../../../services/catalogosService";
import { useAuth } from "../../../services/auth/authContext";
import Loading from "../../../components/common/Loading";
import { monitorarMultiplosCanteiros, } from "../../../services/application/canteiro.application";
import { ACTION_TYPES } from "../../../../shared/types/ACTION_TYPES";
import { monitorarMultiplasPlantas } from "../../../services/application/plantas.application";

export default function MonitorarManualTab({ entidade, selectionData, tipoEntidadeId, showToast, stringTimestamp }) { 
  if (!selectionData || selectionData.length === 0) return null
  const { user } = useAuth();
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [form, setForm] = useState({});
  const [reading, setReading] = useState(false);
  const [writing, setWriting] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getCaracteristicas(),
    ]).then(([carac]) => {
      if (!ativo) return;
      setCaracteristicas(carac);
      setReading(false);
    });
  
    return () => { ativo = false };
  }, []);

  const aplicarMonitoramento = async () => {
    // Recupera as medidas do formulário
    const medidas = {};  
    Object.entries(form).forEach(([caracteristicaId, dados]) => {
      if (dados.atualizar) {
        medidas[caracteristicaId] = {
          valor: dados.valor,
          confianca: dados.confianca,
        };
      }
    });

    // Verifica se há alguma medida para atualizar
    if (Object.keys(medidas).length === 0) {
      showToast("Selecione ao menos uma característica para atualizar.", "danger");
      return;
    }
    
    // Recupera o timestamp
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();

    // Aplica os monitoramentos
    // aplicarMonitoramentos(
    // tipoEntidadeId: "planta" || "canteiro"...
    // medidas: {[caracteristicaId]: {valor, confianca}, ...}
    // user.    {}
    // timestamp: integer
    // entidades: [{}...]
    // )
    //
    // tipoEntidadeId
    // user,
    // timestamp,
    // entidades: [{entidade}...]
    // medidas: {[entidadeId]: {[caracteristicaId]: {valor, confianca}...}...}
    setWriting(true);
    try {
      switch (tipoEntidadeId) {
        case "canteiro":
          monitorarMultiplosCanteiros({
            canteiros: selectionData,
            medidas,
            user,
            actionType: ACTION_TYPES.MONITOR,
            timestamp,
          })
          break;
        case "planta":
          monitorarMultiplasPlantas({
            plantas: selectionData,
            medidas,
            user,
            actionType: ACTION_TYPES.MONITOR,
            timestamp,
          })
          break;
        default:
          throw new Error (`Entidade ${tipoEntidadeId} não é monitorável.`)
      }
      showToast({
        body: `Monitoramento de ${selectionData.length > 1 ? `${selectionData.length} ${tipoEntidadeId}s`: entidade.nome} registrado com sucesso.`,
        variant: "success",
      });
      //Limpa seleção
      setForm({});
    } catch (err) {
      console.error(err)
      showToast({
        body: `Erro ao registrar monitoramento.`,
        variang: "danger"
      });
    } finally {
      setWriting(false);
    }
  }

  if (reading) return <Loading />
  return (
    <>
      {caracteristicas.filter(c => c.aplicavel?.[tipoEntidadeId] === true).map((c) => {
        const item = form[c.id] ?? { valor: 0, atualizar: false, confianca: 100 };
        return (
          <Card key={c.id} className="mb-3 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title className="mb-0 fs-6">{c.nome}</Card.Title>

                <Form.Check
                  type="switch"
                  label="Atualizar"
                  checked={item.atualizar}
                  onChange={(e) =>
                    setForm({...form, [c.id]: {...item, atualizar: e.currentTarget.checked}})
                  }
                />
              </div>

              <Row className="mb-2">
                <InputGroup>
                  <InputGroup.Text>Confiança</InputGroup.Text>
                  <Form.Control
                    type="number"
                    min={0}
                    max={100}
                    value={item.confianca}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [c.id]: {
                          ...item,
                          confianca: Math.min(100, Math.max(0, Number(e.currentTarget.value))),
                          atualizar: true,
                        }
                      })
                    }
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
              </Row>
              <Row className="mb-2">
                <InputGroup>
                  <InputGroup.Text>Valor</InputGroup.Text>
                  <Form.Control
                    type="number"
                    value={item.valor}
                    min={c.min || 0}
                    max={c.max || 1024}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [c.id]: {
                          ...item,
                          valor: Number(e.currentTarget.value),
                          atualizar: true,
                        }
                      })
                    }
                  />
                  <InputGroup.Text>{c.unidade || "un"}</InputGroup.Text>
                </InputGroup>
              </Row>
            </Card.Body>
          </Card>
        )
      })}
      <Button
        variant="success"
        className="mt-3 w-100"
        disabled={writing || selectionData.length === 0}
        onClick={aplicarMonitoramento}
      >
        {selectionData.length === 0 ? "Selecione entidades para monitorar"
        : writing ? "Aplicando monitoramento..."
          : "Aplicar monitoramento"
        }
      </Button>
    </>
  );
}
