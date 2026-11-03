import { Outlet } from "react-router-dom";
import { MapaProvider } from "./mapa/MapaContexto";
import MapaSidebar from "./mapa/sidebar/MapaSidebar";
import MapaPainel from "./mapa/painel/MapaPainel";
import MapaModals from "./mapa/modals/MapaModals"

export default function AppAutomacao() {
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