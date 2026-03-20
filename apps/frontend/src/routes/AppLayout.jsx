import { Outlet } from "react-router-dom";
import AppNavbar from "./Navbar";

function AppLayout() {
  return (
    <>
      <AppNavbar />

      <main className="p-3">
        <Outlet />
      </main>
    </>
  );
}

export default AppLayout;