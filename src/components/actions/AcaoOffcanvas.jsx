import { Offcanvas, Tabs, Tab, Button } from "react-bootstrap";
import ManejarTab from "./ManejarTab";
import InspecionarTab from "./InspecionarTab";
import MonitorarTab from "./MonitorarTab";
import HistoricoTab from "./HistoricoTab";

export default function AcaoOffcanvas({
  show,
  entidade,
  tipoEntidadeId,
  activeTab = "design",
  onTabChange = () => {},
  onClose = () => {},
  onEdit = () => {},
  showToast = () => {},
  customTabs = <></>,
}) {
  if (!entidade) return null;

  const handleTabSelect = (tab) => {
    onTabChange(tab);
  };

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="end"
      backdrop={false}
      scroll
      style={{ width: 420 }}
    >
      <Offcanvas.Header closeButton>
        <div>
          <strong>{entidade.nome}</strong>
          <div className="text-muted small">
            {entidade.dimensao.x * entidade.dimensao.y / 10000} m²
          </div>
        </div>
        <Button
          size="sm"
          variant="warning"
          className="ms-auto"
          onClick={() => onEdit(entidade)}
        >
          Editar
        </Button>
      </Offcanvas.Header>

      <Offcanvas.Body className="p-0">
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          className="px-3 pt-2"
        >
          {customTabs}

          <Tab eventKey="medir" title="Monitorar">
            <MonitorarTab
              entidade={entidade}
              tipoEntidadeId={tipoEntidadeId}
              showToast={showToast}
            />
         </Tab>

          <Tab eventKey="manejo" title="Manejar">
            <ManejarTab
              entidade={entidade}
              tipoEntidadeId={tipoEntidadeId}
              showToast={showToast}
            />
          </Tab>

          <Tab eventKey="inspecao" title="Inspecionar">
            <InspecionarTab
              entidade={entidade}
              tipoEntidadeId={tipoEntidadeId}
              showToast={showToast}/>
          </Tab>
          {entidade.id &&<Tab eventKey="historico" title="Histórico">
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
