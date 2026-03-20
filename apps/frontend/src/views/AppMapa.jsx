import { Outlet } from "react-router-dom";
import { MapaProvider } from "./mapa/MapaContexto";
import MapaSidebar from "./mapa/sidebar/MapaSidebar";
import MapaPainel from "./mapa/painel/MapaPainel";
import MapaModals from "./mapa/modals/MapaModals"

//TODO: CONECTAR AS AÇÕES DE MONITORAMENTO, PLANTIO, DESENHO COM O DOMINIO
//TODO: INSPEÇÃO -- REDESENHAR CONSIDERANDO MIDIAS, USANDO UM MODAL DE INSPEÇÃO
//TODO: ENGINE -- AINDA TENHO QUE LIDAR COM HEATMAP (INSPECAO) E PENDINGMUTATION
export default function AppMapa() {
  return (
    <div className="d-flex vh-100">
      <MapaProvider>
        <MapaSidebar />
        <div className="flex-grow-1 position-relative">
          <Outlet />
          <MapaModals />
        </div>
        <MapaPainel />
      </MapaProvider>
    </div>
  );
}