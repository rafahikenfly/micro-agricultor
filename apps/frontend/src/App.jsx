import "bootstrap/dist/css/bootstrap.min.css";
import Router from "./routes/Router";
import AuthGate from "./services/auth/authGate";
import { AuthProvider } from "./services/auth/authContext";
import { ToastProvider } from "./services/toast/toastProvider";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthGate>
          <Router />
        </AuthGate>
      </ToastProvider>
    </AuthProvider>
  );
}
