import { useAuth } from "./authContext";
import AppLogin from "../../views/AppLogin";
import Loading from "../../components/common/DEPRECATED_Loading";

// TODO: mover para HOOKS

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <AppLogin />;
  return children;
}
