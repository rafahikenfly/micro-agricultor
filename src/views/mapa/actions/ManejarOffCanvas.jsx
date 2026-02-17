import { useEffect, useState } from "react";
import { catalogosService } from "../../../services/catalogosService";
import { handleSelectIdNome, renderOptions } from "../../../utils/formUtils";
import { Button, Form, Offcanvas, } from "react-bootstrap";
import { manejarCanteiro } from "@domain/canteiro.rules";
import { processarEventoComEfeitos } from "@domain/evento.rules";
import { db, nowTimestamp, timestamp } from "../../../firebase";
import { eventosService } from "../../../services/crud/eventosService";
import { historicoEfeitosService } from "../../../services/crud/historicoEfeitosService";
import { canteirosService } from "../../../services/crud/canteirosService";
import { useAuth } from "../../../services/auth/authContext";
import { normalizeSelection, offcanvasTabHeader } from "../ui/OffcanvasPattern"

export default function ManejarOffCanvas({
  show,
  selection,
  onClose,
  showToast,
}) {
  if (!selection) return null

  const { user } = useAuth();

  const [form, setForm] = useState({});
  const [manejoSelecionado, setManejo] = useState({})
  const [manejos, setManejos] = useState([]);
  const [reading, setReading] = useState(false);
  const [writing, setWriting] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getManejos(),
    ]).then(([manej]) => {
      if (!ativo) return;
      setManejos(manej);
      setReading(false);
    });
  
    return () => { ativo = false };
  }, []);
  if (!selection) return null;

  const {entidade, selectionNormalizada, tipoEntidadeId} = normalizeSelection(selection)
  const header = offcanvasTabHeader ({selection: selectionNormalizada, tipoEntidadeId})
  const aplicarManejo = () => {
    setWriting(true);
    try {
      const monitoramento = processarEventoComEfeitos({
        tipoEventoId: "manejo",
        origem: {id: user.id, tipo: "usuário"},
        alvos: selection, //TODO: reduce para apenas entidades do mesmo tipoEntidadeId
        regra: manejarCanteiro, //TODO: fazer um resolveService ou um objeto resolvido
        contexto: {
          manejo: manejoSelecionado,
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
        ? `Manejo de 
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
        `Erro ao salvar manejo de 
        ${selection.length > 1 ? selection.length + "canteiros": selection[0].data.nome}
        .`, //TODO: fazer um resolve
        "danger"
      );
    } finally {
      setWriting(false);
    }
  }

  const manejosAplicaveis = manejos.filter(
    m => m.aplicavel?.[tipoEntidadeId] === true
  );

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      backdrop={false}
      placement="end"
      scroll
      style={{ width: 420, padding: "8px 12px" }}
    >
      <Offcanvas.Header closeButton>{header}</Offcanvas.Header>
      <Offcanvas.Body>
        {selection.length > 0 && <Form>
          <Form.Group>
            <Form.Label>Manejo</Form.Label>
            <Form.Select
              value={manejoSelecionado.id || ""}
              onChange={(e) => setManejo(manejos.find((c)=>c.id === e.target.value))/*setForm({...form, caracteristicaId: e.target.value})}*/}
            >
              {renderOptions({
                list: manejosAplicaveis,
                loading: reading,
                placeholder: "Selecione o manejo",
              })}
            </Form.Select>
          </Form.Group>
          <div className="p-2 border rounded bg-light mb-3">
            <strong>Resumo do manejo</strong>
            <div>Manejo: {manejoSelecionado.nome || "-"}</div>
            <div>Descrição: {manejoSelecionado.descricao || "-"}</div>
          </div>
          <div className="d-grid gap-2">
            <Button
              variant="success"
              disabled={!manejoSelecionado || selection.length === 0}
              onClick={aplicarManejo}
            >
              {selection.length === 0 ? "Selecione entidades para manejar"
              : writing ? "Aplicando manejo..."
                : "Aplicar manejo"
              }
            </Button>
          </div>
        </Form>}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
