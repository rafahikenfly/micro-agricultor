import { useAuth } from "./authContext";
import AppLogin from "../../views/AppLogin";
import Loading from "../../components/common/DEPRECATED_Loading";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <AppLogin />;
  return children;
}
