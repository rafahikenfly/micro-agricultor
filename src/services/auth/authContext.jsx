import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FIREBASE AUTH ================= */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const doc = await db.collection("usuarios")
          .doc(firebaseUser.uid)
          .get();

        if (!doc.exists) {
          console.error("Usuário sem documento no Firestore.");
          setUser(null);
          setLoading(false);
          return;
        }

        setUser({
          uid: firebaseUser.uid,
          ...doc.data(),
        });

      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ================= HELPERS ================= */
  const hasAccess = (ambiente) => {
    return user?.acesso?.[ambiente] === true;
  };

  /* ================= AUTH ACTIONS ================= */
  const login = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const logout = () => {
    return auth.signOut();
  };

  const setAmbiente = async (ambiente) => {
    if (!user) return;
    if (!hasAccess(ambiente)) return;

    await db.collection("usuarios").doc(user.uid).update({
      ambienteAtivo: ambiente,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasAccess,
        setAmbiente,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}