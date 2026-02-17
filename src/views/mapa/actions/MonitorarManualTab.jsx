import { useEffect, useState } from "react";
import { Form, Button, InputGroup, Row, Col, Card, } from "react-bootstrap";
import { catalogosService } from "../../../services/catalogosService";
import { eventosService, } from "../../../services/crud/eventosService";
import { useAuth } from "../../../services/auth/authContext";
import { monitorarCanteiro } from "@domain/canteiro.rules";
import { monitorarPlanta } from "@domain/planta.rules";
import { processarEventoComEfeitos } from "@domain/evento.rules";
import { db, nowTimestamp, timestamp, } from "../../../firebase";
import { canteirosService } from "../../../services/crud/canteirosService";
import { plantasService } from "../../../services/crud/plantasService";
import { historicoEfeitosService } from "../../../services/crud/historicoEfeitosService";
import Loading from "../../../components/common/Loading";

export default function MonitorarManualTab({ selection, tipoEntidadeId, showToast }) { //entidade, 
  if (!selection || selection.length === 0) return null

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

    const medidas = {};  
    Object.entries(form).forEach(([caracteristicaId, dados]) => {
      if (dados.atualizar) {
        medidas[caracteristicaId] = {
          valor: dados.valor,
          confianca: dados.confianca,
        };
      }
    });
    
    if (Object.keys(medidas).length === 0) {
      showToast("Selecione ao menos uma característica para atualizar.", "danger");
      return;
    }
    
    setWriting(true);
    try {
      const monitoramento = processarEventoComEfeitos({
        tipoEventoId: "monitoramento",
        origem: {id: user.id, tipo: "usuário"},
        alvos: selection, //TODO: reduce para apenas as entidades do mesmo tipo!
        regra: monitorarCanteiro, //TODO: fazer um resolveService ou um objeto resolvido
        contexto: {
          medidas,
          timestamp: nowTimestamp(),
        },
        user: user,
        db: db,
        services: {
          eventosService: eventosService,
          historicoEfeitosService: historicoEfeitosService,
          entidadeService: canteirosService.forParent(selection[0]?.data.hortaId), //TODO: fazer um resolveService ou um objeto resolvido
        },
        createdAt: nowTimestamp(),
      })
      showToast(monitoramento.opCount > 0 
        ? `Monitoramento de 
        ${selection.length > 1 ? selection.length + "canteiros": selection[0].data.nome} 
        registrado com sucesso.` //TODO: fazer um resolve
        : `Nenhuma alteração detectada em 
        ${selection.length > 1 ? selection.length + "canteiros": selection[0].data.nome}
        .` //TODO: fazer um resolve
      );
      //Limpa seleção
      setForm({});
    } catch (err) {
      console.error(err)
      showToast(
        `Erro ao salvar monitoramento de 
        ${selection.length > 1 ? selection.length + "canteiros": selection[0].data.nome}
        .`, //TODO: fazer um resolve
        "danger"
      );
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
        disabled={writing || selection.length === 0}
        onClick={aplicarMonitoramento}
      >
        {selection.length === 0 ? "Selecione entidades para monitorar"
        : writing ? "Aplicando monitoramento..."
          : "Aplicar monitoramento"
        }
      </Button>
    </>
  );
}
