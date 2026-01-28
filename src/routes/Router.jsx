import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppAdmin from "../app/AppAdmin";
import AppUsuario from "../app/AppUsuario";
import AppSelector from "../app/AppSelector";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz decide o ambiente automaticamente */}
        <Route path="/" element={<AppSelector />} />
        <Route path="/usuario/*" element={<AppUsuario />} />
        <Route path="/admin/*" element={ <AppAdmin /> }/>
      </Routes>
    </BrowserRouter>
  );
}
