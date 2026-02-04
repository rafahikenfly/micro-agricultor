import { useEffect, useState } from "react";
import { Form, Button, InputGroup, Row, Col, } from "react-bootstrap";
import { catalogosService } from "../../services/catalogosService";
import { eventosService, } from "../../services/crud/eventosService";
import { useAuth } from "../../services/auth/authContext";
import { monitorarCanteiro } from "../../domain/canteiro.rules";
import { monitorarPlanta } from "../../domain/planta.rules";
import { calcularEfeitosDoEvento, montarLogEvento } from "../../domain/evento.rules";
import { db, } from "../../firebase";
import { canteirosService } from "../../services/crud/canteirosService";
import { plantasService } from "../../services/crud/plantasService";
import { historicoEfeitosService } from "../../services/crud/historicoEfeitosService";

export default function MonitorarTab({ entidade, tipoEntidadeId, showToast }) {
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
    
    // TODO ***
    // Esta função abaixo pode ser generalizada para uma função de criação de eventos com
    // efeitos. Para isso, eu tenho uma regra para cada tipo de entidade (ex: monitorarCanteiro,
    // monitorarPlanta), que é passada para a função que cria o evento, calcula os efeitos na
    // entidade, completa o evento e depois registra tanto o efeitosHistorico quanto o próprio
    // evento. Ela já está repetida na aplicação de manejos e na aplicação de efeitos de tempo no
    // google functions. 
    setWriting(true);
    try {
      // Cria o eventoRef imediatamente para obter Id e monta o log (sem efeitos)
      let batch = db.batch();
      let opCount = 0;
      let entidadeMonitorada
      let entidadeRef
      const eventoRef = eventosService.criarRef();
      const evento = montarLogEvento({
        data: {
          efeitos: [],
        },
        tipoEventoId: "monitoramento",
        alvos: [{id: entidade.id, tipoEntidadeId: tipoEntidadeId}],
        origemId: user.id,
        origemTipo: "usuario",
      })

      // Aplica o monitoramento conforme o tipo de entidade
      if (tipoEntidadeId === "canteiro") {
        entidadeMonitorada = monitorarCanteiro ({
          canteiro: entidade,
          medidas: medidas,
          eventoId: eventoRef.id,
        });
        entidadeRef = canteirosService.forParent(entidade.hortaId).getRefById(entidade.id);
      } else if (tipoEntidadeId === "planta") {
        entidadeMonitorada = monitorarPlanta ({
          planta: entidade,
          medidas: medidas,
          eventoId: eventoRef.id,
        });
        entidadeRef = plantasService.getRefById(entidade.id);
      } else {
        console.error (`Tipo de entidade ${tipoEntidadeId} inválida para monitoramento`)
        showToast(`Monitoramento de entidade ${tipoEntidadeId} inválido.`, "danger");
        return;
      }

      // Calcula os efeitos da entidade monitorada
      const efeitosDoMonitoramento = calcularEfeitosDoEvento({
        entidadeId: entidade.id,
        eventoId: eventoRef.id,
        tipoEventoId: "monitoramento",
        estadoAntes: entidade?.estadoAtual || {},
        estadoDepois: entidadeMonitorada?.estadoAtual || {},
        tipoEntidadeId: tipoEntidadeId,
      })
      // Se há efeitos no canteiro
      if (efeitosDoMonitoramento.length) {
        // Atualiza estadoAtual da entidade pelo batch
        if (tipoEntidadeId === "canteiro") canteirosService.forParent(entidade.hortaId).batchUpdate(entidadeRef, { estadoAtual: entidadeMonitorada.estadoAtual, }, user, batch);
        if (tipoEntidadeId === "planta")   plantasService.batchUpdate(entidadeRef, { estadoAtual: entidadeMonitorada.estadoAtual, }, user, batch);
        opCount++;
      
        // Denormalização efeitos para o histórico
        efeitosDoMonitoramento.forEach((efeito) => {
          historicoEfeitosService.batchCreate(efeito, user, batch);
          opCount++;
        });
      }

      // Adiciona os efeitos do canteiro ao evento e prepara para commit se há efeitos
      evento.efeitos = [...evento.efeitos, ...efeitosDoMonitoramento]
      // Atualiza o evento pelo batch
      eventosService.batchUpsert(eventoRef, evento, user, batch);
      opCount++;

      // Commit
      await batch.commit();
        showToast(opCount > 0 ? 
          `Manejo de ${entidade.nome} registrado com sucesso.` :
          `Nenhuma alteração detectada em ${entidade.nome}.`);

      //Limpa seleção
      setForm({});
    } catch (err) {
      console.error(err)
      showToast(`Erro ao salvar monitoramento de ${entidade.nome}: ${err}. Tente novamente.`, "danger");
    } finally {
      setWriting(false);
    }
  };

  return (
    <div className="p-3"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
          {caracteristicas.filter(c => c.aplicavel?.[tipoEntidadeId] === true).map((c) => {
            const item = form[c.id] ?? { valor: 0, atualizar: false, confianca: 100 };
            return (
              <Form.Group key={c.id} className="mb-3" >
                <Form.Label>{c.nome}</Form.Label>
                  <Row className="mb-2">
                    <InputGroup>
                      <Form.Check
                        label="Atualizar"
                        checked={item.atualizar}
                        onChange={(e) => setForm({...form, [c.id]: {...item, atualizar: e.currentTarget.checked}})}
                      />
                      <InputGroup.Text>Confiança</InputGroup.Text>
                      <Form.Control
                        type="number"
                        min={0}
                        max={100}
                        title="Confiança"
                        value={item.confianca}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            [c.id]: {
                              ...item,
                              confianca: Math.min(100, Math.max(0, Number(e.currentTarget.value)))
                            }
                          })
                        }
                        style={{ maxWidth: 90 }}
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                  </Row>
                  <Row>
                    <InputGroup>
                      <InputGroup.Text>Valor</InputGroup.Text>

                      <Form.Control
                        type="number"
                        value={item.valor}
                        onChange={(e) => setForm({...form, [c.id]: {...item, valor: Number(e.currentTarget.value), atualizar: true}})}
                      />
                      <InputGroup.Text>{c.unidade || "un"}</InputGroup.Text>
                    </InputGroup>
                  </Row>
              </Form.Group>
            )
          })}
      <Button
        variant="success"
        className="mt-3 w-100"
        disabled={writing}
        onClick={aplicarMonitoramento}
      >
        {writing ? "Aplicando monitoramento..." : "Aplicar monitoramento"}
      </Button>
    </div>
  );
}
