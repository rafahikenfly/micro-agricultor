import { Offcanvas, Tabs, Tab, Form, } from "react-bootstrap";
import MonitorarManualTab from "./MonitorarManualTab";
import HistoricoTab from "./HistoricoTab";
import { offcanvasTabHeader } from "../ui/OffcanvasPattern"
import CVTab from "./CVTab";
import { useState } from "react";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { TIPOS_ENTIDADE } from "../../../utils/consts/TIPOS_ENTIDADE";
import { toDateTimeLocal } from "../../../utils/dateUtils";


export default function MonitorarOffcanvas({
  show,
  selectionData,
  onClose,
  showToast,
}) {
  if (!selectionData) return null;
  const [tipoEntidadeId, setTipoEntidadeId] = useState(null);
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  const list = selectionData[tipoEntidadeId] ?? [];
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
              list: TIPOS_ENTIDADE.filter((a)=>a.monitoravel),
              placeholder: "Selecione o tipo de entidade",
              nullOption: true,
              isOptionDisabled: (a)=>!selectionData[a.id] || selectionData[a.id].length === 0
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
          <Tab eventKey="medir" title="Monitorar">
            <MonitorarManualTab
              entidade={last}
              selectionData={list}
              tipoEntidadeId={tipoEntidadeId}
              showToast={showToast}
              stringTimestamp={stringTimestamp}
            />
          </Tab>
          <Tab eventKey="CV" title="Visão Computacional">
            <CVTab
              entidade={last}
              tipoEntidadeId={tipoEntidadeId}
              showToast={showToast}
            />
          </Tab>
        </Tabs>}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
//TODO: HistóricoTab deve ir para Inspecionar!