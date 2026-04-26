//TODO: Mover para hooks

import React, { createContext, useContext, useState } from "react";
import { AppToastConfirmacao, AppToastMensagem } from "../../components/common/toast";
import { VARIANTE } from "micro-agricultor";

// Contexto
const ToastContext = createContext();

// Provider
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    show: false,
    confirmacao: false,
    body: "",
    variant: VARIANTE.LIGHTBLUE.variant,
    onConfirm: null,
    onCancel: null,
  });

  // Disparar uma mensagem simples
  const toastMessage = ({body, variant = VARIANTE.LIGHTBLUE.variant}) => {
    setToast({
      show: true,
      confirmacao: false,
      body,
      variant,
      onConfirm: null,
      onCancel: null,
    });
  };

  // Disparar uma confirmação
  const toastConfirm = ({body, onConfirm, onCancel = null, variant = VARIANTE.YELLOW.variant}) => {
    setToast({
      show: true,
      confirmacao: true,
      body,
      variant,
      onConfirm: () => {
        onConfirm?.();
        setToast(prev => ({ ...prev, show: false }));
      },
      onCancel: () => {
        onCancel?.();
        setToast(prev => ({ ...prev, show: false }));
      },
    });
  };

  return (
    <ToastContext.Provider value={{ toastMessage, toastConfirm }}>
      {children}

      <AppToastMensagem
        show={toast.show && !toast.confirmacao}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
        body={toast.body}
        variant={toast.variant}
      />

      <AppToastConfirmacao
        show={toast.show && toast.confirmacao}
        onCancel={toast.onCancel}
        onConfirm={toast.onConfirm}
        body={toast.body}
        variant={toast.variant}
      />
    </ToastContext.Provider>
  );
}

// Hook para consumir o contexto
export const useToast = () => useContext(ToastContext);