import { Offcanvas, Tabs, Tab, Button } from "react-bootstrap";
import ManejarTab from "../actions/ManejarTab";
import NovoCVJobTab from "../actions/NovoCVJob";
import MonitorarTab from "../actions/MonitorarTab";

export default function AcaoPlantaOffcanvas({
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
            {data.especieNome} ({data.variedadeNome})
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
          <Tab eventKey="design" title="Design">
            DESENHAR PLANTA
          </Tab>

          <Tab eventKey="manejo" title="Manejar">
              <ManejarTab entidade={data} tipoEntidade={"Planta"} />
          </Tab>

          <Tab eventKey="medicao" title="Monitorar">
            <MonitorarTab entidade={data} tipoEntidade="Planta" />
          </Tab>

          <Tab eventKey="inspecao" title="Inspecionar">
            <NovoCVJobTab entidade={data} tipoEntidade={"Planta"}/>
          </Tab>

          <Tab eventKey="historico" title="Histórico">
            HISTORICO PLANTA
          </Tab>

        </Tabs>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
