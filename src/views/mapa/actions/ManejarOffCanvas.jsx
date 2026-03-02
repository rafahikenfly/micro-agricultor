import { useEffect, useState } from "react";
import { catalogosService } from "../../../services/catalogosService";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { Button, Form, Offcanvas, } from "react-bootstrap";
import { useAuth } from "../../../services/auth/authContext";
import { offcanvasTabHeader } from "../ui/OffcanvasPattern"
import { TIPOS_ENTIDADE } from "../../../utils/consts/TIPOS_ENTIDADE";
import { ISOToReadableString, toDateTimeLocal } from "../../../utils/dateUtils";
import { monitorarMultiplosCanteiros } from "../../../services/application/canteiro.application";
import { monitorarMultiplasPlantas } from "../../../services/application/plantas.application";

export default function ManejarOffCanvas({
  show,
  selectionData,
  onClose,
  showToast,
}) {
  if (!selectionData) return null;

  const { user } = useAuth();

  const [tipoEntidadeId, setTipoEntidadeId] = useState(null);
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
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
  const list = selectionData[tipoEntidadeId] ?? [];
  const last = list.at(-1) ?? {};
  const header = offcanvasTabHeader ({tipoEntidadeId, list})

  const manejosAplicaveis = manejos.filter(
    m => m.aplicavel?.[tipoEntidadeId] === true
  );  

  const aplicarManejo = () => {
    // Recupera o timestamp
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();

    setWriting(true);
    try {
      switch (tipoEntidadeId) {
        case "canteiro":
          monitorarMultiplosCanteiros({ //TODO: USAR FUNCAO GENERICA DE MANIPULACAO DE CANTEIROS
            canteiros: selectionData,
            medidas,
            user,
            actionType: ACTION_TYPES.MONITOR,
            timestamp,
          })
          break;
        case "planta":
          monitorarMultiplasPlantas({ //TODO: USAR FUNCAO GENERICA DE MANIPULACAO DE CANTEIROS
            plantas: selectionData,
            medidas,
            user,
            actionType: ACTION_TYPES.MONITOR,
            timestamp,
          })
          break;
        default:
          throw new Error (`Entidade ${tipoEntidadeId} não é manejável.`)
      }
      showToast({
        body: `Manejo de ${selectionData.length > 1 ? `${selectionData.length} ${tipoEntidadeId}s`: entidade.nome} registrado com sucesso.`,
        variant: "success",
      });
      //Limpa seleção
      setForm({});
    } catch (err) {
      console.error(err)
      showToast({
        body: `Erro ao registrar manejo.`,
        variang: "danger"
      });
    } finally {
      setWriting(false);
    }
  }

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      backdrop={false}
      placement="end"
      scroll
      style={{ width: 420, padding: "8px 12px" }}
    >
      <Offcanvas.Header closeButton>🪏{header}</Offcanvas.Header>
      <Offcanvas.Body>
        <StandardInput label="Manejar" width="120px">
          <Form.Select
            value={tipoEntidadeId ?? ""}
            onChange={(e)=>setTipoEntidadeId(e.target.value)}
          >
            {renderOptions({
              list: TIPOS_ENTIDADE.filter((a)=>a.monitoravel),
              placeholder: "Selecione o tipo de entidade",
              nullOption: true,
              isOptionDisabled: (a)=>!selectionData[a.id] || selectionData[a.id].length === 0
            })}
          </Form.Select>
        </StandardInput>
        <StandardInput label="Manejo" width="120px">
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
        </StandardInput>
          <StandardInput label="Data/hora" width="120px">
            <Form.Control
              type="datetime-local"
              value={stringTimestamp}
              onChange={(e)=> setStringTimestamp(e.target.value)}
            />
          </StandardInput>
          <div className="p-2 border rounded bg-light mb-3">
            <strong>Resumo do manejo</strong>
            <div>Data/Hora: {ISOToReadableString(stringTimestamp)}</div>
            <div>Manejo: {manejoSelecionado.nome || "-"}</div>
            <div>{list.length > 1 ? `Alvos: ${list.length} ${tipoEntidadeId}s` : `Alvo: ${last.nome}`}</div>
            <div>Descrição: {manejoSelecionado.descricao || "-"}</div>
          </div>
          <div className="d-grid gap-2">
            <Button
              variant="success"
              disabled={!manejoSelecionado || list.length === 0}
              onClick={aplicarManejo}
            >
              {list.length === 0 ? "Selecione entidades para manejar"
              : writing ? "Aplicando manejo..."
                : "Aplicar manejo"
              }
            </Button>
          </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
