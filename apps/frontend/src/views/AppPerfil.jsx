import { Outlet } from "react-router-dom";

export default function AppPerfil() {
  return (
    <div className="d-flex">

      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>

    </div>
  );
}