import { Offcanvas, Tabs, Tab, Form, } from "react-bootstrap";
import { offcanvasTabHeader } from "../legacy/OffcanvasPattern"
import CVTab from "../legacy/CVTab";
import { useState } from "react";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { toDateTimeLocal } from "../../../utils/dateUtils";
import { ENTIDADE } from "micro-agricultor";
import MonitoramentoGlobalTab from "../legacy/MonitoramentoGlobalTab";
import MonitoramentoIndividualTab from "../legacy/MonitoramentoIndividualTab";
import { resolveSelection } from "../../../utils/catalogUtils";


export default function MonitorarOffcanvas({ show, selection, catalogos, onClose, }) {
  //TODO: SE TIVER APENAS UM TIPO DE SELEÇÃO, CARREGA O TIPOENTIDADEID
  if (!selection || !show) return null;

  //TODO: USAR FORM
  const [tipoEntidadeId, setTipoEntidadeId] = useState(null);
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  const list = resolveSelection(selection, tipoEntidadeId, catalogos[tipoEntidadeId]);
  const last = list.at(-1) ?? {};
  const header = offcanvasTabHeader ({tipoEntidadeId, list})

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="end"
      backdrop={false}
      scroll
      style={{ width: 420, padding: "8px 12px" }}
    >
      <Offcanvas.Header closeButton>
        🔬 {header}
      </Offcanvas.Header>
      
     <Offcanvas.Body className="p-0">
        <StandardInput label="Monitorar" width="120px">
          <Form.Select
            value={tipoEntidadeId ?? ""}
            onChange={(e)=>setTipoEntidadeId(e.target.value)}
          >
            {renderOptions({
              list: Object.values(ENTIDADE).filter((a)=>a.monitoravel),
              placeholder: "Selecione o tipo de entidade",
              nullOption: true,
              isOptionDisabled: (a) => !selection.hasType(a.id),
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

        {tipoEntidadeId && list.length > 0 && <Tabs className="px-3 pt-2">
          <Tab eventKey="global" title="Todos">
            <MonitoramentoGlobalTab
              entidades={list}
              tipoEntidadeId={tipoEntidadeId}
              stringTimestamp={stringTimestamp}
            />
          </Tab>
          <Tab eventKey="individual" title="Individual">
            <MonitoramentoIndividualTab
              entidades={list}
              tipoEntidadeId={tipoEntidadeId}
              stringTimestamp={stringTimestamp}
            />
          </Tab>
          <Tab eventKey="CV" title="Automático">
            <CVTab
              entidade={last}
              tipoEntidadeId={tipoEntidadeId}
            />
          </Tab>
        </Tabs>}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
//TODO: HistóricoTab deve ir para Inspecionar!