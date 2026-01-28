/*import { useAuth } from "./authContext";
import NoAccess from "../../components/common/NoAccess";

export default function AuthAmbiente({ ambiente, children }) {
  const { user, hasAccess } = useAuth();

  if (!user) return null; // AuthGate já cuidou disso
  if (!hasAccess(ambiente)) return <NoAccess ambiente={ambiente}/>;

  return children;
}
*/