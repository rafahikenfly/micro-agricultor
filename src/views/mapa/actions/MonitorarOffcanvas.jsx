import { Offcanvas, Tabs, Tab, } from "react-bootstrap";
import MonitorarManualTab from "./MonitorarManualTab";
import HistoricoTab from "./HistoricoTab";
import MonitorarAutomaticoTab from "./CVTab";
import { normalizeSelection, offcanvasTabHeader } from "../ui/OffcanvasPattern"
import CVTab from "./CVTab";

export default function MonitorarOffcanvas({
  show,
  selection,
  onClose = () => {},
  showToast
}) {
  if (!selection) return null;

  const {entidade, selectionNormalizada, tipoEntidadeId} = normalizeSelection(selection)
  const header = offcanvasTabHeader ({selection: selectionNormalizada, tipoEntidadeId})

  console.log(entidade)
  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="end"
      backdrop={false}
      scroll
      style={{ width: 420, padding: "8px 12px" }}
    >
      <Offcanvas.Header closeButton>{header}</Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        <Tabs className="px-3 pt-2">

          {selectionNormalizada.length > 0 && <Tab eventKey="medir" title="Monitorar">
            <MonitorarManualTab
              selection={selectionNormalizada}
              tipoEntidadeId={tipoEntidadeId}
              showToast={showToast}
            />
          </Tab>}
          {entidade?.id &&<Tab eventKey="CV" title="Visão Computacional">
            <CVTab
              entidade={entidade}
              tipoEntidadeId={tipoEntidadeId}
              showToast={showToast}
            />
          </Tab>}
          {entidade?.id &&<Tab eventKey="historico" title="Histórico">
            <HistoricoTab
              entidade={entidade}
              tipoEntidadeId={tipoEntidadeId}
              showToast={showToast}
            />
          </Tab>}
        </Tabs>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
