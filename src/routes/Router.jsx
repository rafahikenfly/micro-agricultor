// src/routes/Router.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../app/Login";
import AppAdmin from "../views/ambientes/AppAdmin"
import AppMapa from "../views/ambientes/AppMapa";
import AppCalendario from "../views/ambientes/AppCalendario";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppMapa />} />
        <Route path="/mapa/*" element={<AppMapa />} />
        <Route path="/calendario/*" element={<AppCalendario />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AppAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}