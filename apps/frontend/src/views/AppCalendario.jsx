import { Outlet } from "react-router-dom";
import CalendarioSidebar from "./calendario/sidebar/CalendarioSidebar";
import { CalendarioProvider } from "./calendario/CalendarioContexto";
import CalendarioModals from "./calendario/modals/CalendarioModals";

//TODO: REVISAR TODO O COMPONENTE ANTIGO
export default function AppCalendario() {
  return (
    <div className="d-flex vh-100">
      <CalendarioProvider>
        <CalendarioSidebar />
        <div className="flex-grow-1 position-relative">
          <Outlet />
          <CalendarioModals />
        </div>
      </CalendarioProvider>        
    </div>
  );
}