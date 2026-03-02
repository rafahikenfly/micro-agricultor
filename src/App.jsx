import Router from "./routes/Router";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./services/auth/authContext";
import AuthGate from "./services/auth/authGate";
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
