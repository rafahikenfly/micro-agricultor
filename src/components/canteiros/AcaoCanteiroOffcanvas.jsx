import { Offcanvas, Tabs, Tab, Button } from "react-bootstrap";
import ManejarTab from "../actions/ManejarTab";
import MonitorarCanteiroTab from "../actions/MonitorarCanteiroTab";
import DesenharCanteiroTab from "../actions/DesenharCanteiroTab";
import NovoCVJobTab from "../actions/NovoCVJob";
import MonitorarTab from "../actions/MonitorarTab";

export default function AcaoCanteiroOffcanvas({
  show,
  data,
  activeTab = "design",
  onTabChange = () => {},
  onClose = () => {},
  onModeChange = () => {},
  onEdit = () => {},
}) {
  if (!data) return null;

  const handleTabSelect = (tab) => {
    onTabChange(tab);

    const modeMap = {
      manejo: "pan",
      medir: "pan",
      visao: "pan",
      historico: "zoom",
      design: "zoom",
    };

    onModeChange(modeMap[tab] ?? "edit");
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
          <strong>{data.nome}</strong>
          <div className="text-muted small">
            {data.dimensao.x * data.dimensao.y / 10000} m²
          </div>
        </div>
        <Button
          size="sm"
          variant="warning"
          className="ms-auto"
          onClick={() => onEdit(data)}
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
          <Tab eventKey="design" title="Desenhar">
            <DesenharCanteiroTab canteiro={data} />
          </Tab>

          <Tab eventKey="manejo" title="Manejar">
            <ManejarTab entidade={data} tipoEntidade={"Canteiro"} />
          </Tab>

          <Tab eventKey="medir" title="Monitorar">
            <MonitorarTab entidade={data} tipoEntidade={"Canteiro"}/>
          </Tab>

          <Tab eventKey="inspecao" title="Inspecionar">
            <NovoCVJobTab entidade={data} tipoEntidade={"Canteiro"}/>
          </Tab>

          <Tab eventKey="historico" title="Histórico">
            Histórico tab
            {/*<HistoricoTab canteiroId={data.id} />*/}
          </Tab>

        </Tabs>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
