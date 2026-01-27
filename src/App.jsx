import Router from "./routes/Router";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./services/auth/authContext";
import AuthGate from "./services/auth/authGate";

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <Router />
      </AuthGate>
    </AuthProvider>
  );
}
