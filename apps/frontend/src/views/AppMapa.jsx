import { Outlet } from "react-router-dom";
import { MapaProvider } from "./mapa/MapaContexto";
import MapaSidebar from "./mapa/sidebar/MapaSidebar";
import MapaPainel from "./mapa/painel/MapaPainel";
import MapaModals from "./mapa/modals/MapaModals"

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