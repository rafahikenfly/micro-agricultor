import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppSelector from "../app/AppSelector";
import AppAdmin from "../app/AppAdmin";
import AppUsuario from "../app/AppUsuario";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppSelector />} />
        <Route path="/admin/*" element={<AppAdmin />} />
        <Route path="/usuario/*" element={<AppUsuario />} />
      </Routes>
    </BrowserRouter>
  );
}
