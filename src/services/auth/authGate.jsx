import { useAuth } from "./authContext";
import Login from "../../app/Login";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return user ? children : <Login />;
}
