import { Outlet } from "react-router-dom";
import AnaliseSidebar from "./analise/AnaliseSidebar";

export default function AppAnalise() {
  return (
    <div className="d-flex">

      <AnaliseSidebar />

      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>

    </div>
  );
}