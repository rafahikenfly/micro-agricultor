import { Outlet } from "react-router-dom";
import AdminSidebar from "./admin/AdminSidebar";

export default function AppAdmin() {
  return (
    <div className="d-flex">

      <AdminSidebar />

      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>

    </div>
  );
}