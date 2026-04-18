import { BrowserRouter, Routes, Route } from "react-router-dom";
//LOGIN
import AppLogin from "../views/AppLogin"
//ADMIN
import AppAdmin from "../views/AppAdmin"
import AppLayout from "./AppLayout";
import HortasCRUD from "../views/admin/hortas/HortasCRUD";
import CanteirosCRUD from "../views/admin/canteiros/CanteirosCRUD";
import PlantasCRUD from "../views/admin/plantas/PlantasCRUD";
import EspeciesCRUD from "../views/admin/especies/EspeciesCRUD";
import VariedadesCRUD from "../views/admin/variedades/VariedadesCRUD";
import CaracteristicasCRUD from "../views/admin/caracteristicas/CaracteristicasCRUD";
import ManejosCRUD from "../views/admin/manejos/ManejosCRUD";
import TarefasCRUD from "../views/admin/tarefas/TarefasCRUD";
import EstadosCanteiroCRUD from "../views/admin/estadosCanteiros/EstadosCanteiroCRUD";
import EstadosPlantaCRUD from "../views/admin/estadosPlantas/EstadosPlantaCRUD";
import MidiasCRUD from "../views/admin/midias/MidiasCRUD";
import CategoriasCRUD from "../views/admin/categorias/CategoriasCRUD";
//MAPA
//TODO: indexar o mapa no url
import AppMapa from "../views/AppMapa";
import MapaCanvas from "../views/mapa/canvas/MapaCanvas";
import { MapaVazio } from "../views/mapa/canvas/MapaVazio";
import AppCalendario from "../views/AppCalendario";
import { CalendarioVazio } from "../views/calendario/canvas/CalendarioVazio";
import CalendarioCanvas from "../views/calendario/canvas/CalendarioCanvas";
import DispositivosCRUD from "../views/admin/dispositivos/DispositivosCRUD";
//import AppCalendario from "../views/ambientes/AppCalendario";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="login" element={<AppLogin />} />
          <Route path="admin" element={<AppAdmin />}>
            <Route path="hortas" element={<HortasCRUD />} />
            <Route path="canteiros" element={<CanteirosCRUD />} />
            <Route path="plantas" element={<PlantasCRUD />} />
            <Route path="especies" element={<EspeciesCRUD />} />
            <Route path="variedades" element={<VariedadesCRUD />} />
            <Route path="manejos" element={<ManejosCRUD />} />
            <Route path="dispositivos" element={<DispositivosCRUD />} />
            <Route path="caracteristicas" element={<CaracteristicasCRUD />} />
            <Route path="estados-canteiro" element={<EstadosCanteiroCRUD />} />
            <Route path="estados-planta" element={<EstadosPlantaCRUD />} />
            <Route path="categorias-especies" element={<CategoriasCRUD />} />
            <Route path="tarefas" element={<TarefasCRUD />} />
            <Route path="midias" element={<MidiasCRUD />} />
          </Route>
          <Route path="/mapa" element={<AppMapa />}>
            <Route index element={<MapaVazio />} />
          </Route>
          <Route path="/mapa/:hortaId" element={<AppMapa />}>
            <Route index element={<MapaCanvas />} />
          </Route>
          <Route path="/calendario" element={<AppCalendario />}>
            <Route index element={<CalendarioVazio />} />
          </Route>
          <Route path="/calendario/:hortaId" element={<AppCalendario />}>
            <Route index element={<CalendarioCanvas />} />
          </Route>
        </Route>


{/*
        <Route path="/calendario/*" element={<AppCalendario />} />
*/}
      </Routes>
    </BrowserRouter>
  );
}