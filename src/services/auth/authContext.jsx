import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "app:user";


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =================== LOCALSTORAGE =================== */
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /* =================== HELPERS =================== */
  const hasAccess = (ambiente) => {
    return user?.acessos?.[ambiente] === true;
  };  
  
  /* =================== AUTH ACTIONS =================== */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const setAmbiente = async (ambiente) => {
    if (!user) return;
    if (!hasAccess(ambiente)) return;
    //TODO: persistir no banco de dados a mudança de ambiente do usuário
    const updatedUser = { ...user, ambienteAtivo: ambiente };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
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
    >      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
