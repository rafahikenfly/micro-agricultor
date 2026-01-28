import { useAuth } from "./authContext";
import Login from "../../app/Login";
import Loading from "../../components/common/Loading";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Login />;
  return children;
}
