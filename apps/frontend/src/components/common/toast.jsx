import React from "react";
import {
  Button, Toast,
  ToastContainer
} from "react-bootstrap";

/* ================= TOASTS ================= */
export function AppToastMensagem({ show, onClose, header, body, variant }) {
  if (!show) return null;
  if (!header && variant === "success") header = "Sucesso";
  if (!header && variant === "danger") header = "Erro";
  if (!header && variant === "warning") header = "Atenção";
  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast bg={variant} show={show} onClose={onClose} delay={3000} autohide>
        <Toast.Header closeButton>
          <strong className="me-auto">
            {header}
          </strong>
        </Toast.Header>
        <Toast.Body className="text-white">
          {body}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
export function AppToastConfirmacao({ show, onClose, header, body, variant, onConfirm, onCancel }) {
  if (!show) return null;
  if (!header && variant === "success") header = "Sucesso";
  if (!header && variant === "danger") header = "Erro";
  if (!header && variant === "warning") header = "Atenção";

  const BUTTON_VARIANT = {
  //PROP:   [, SIM, NAO]
    success: ["success", "secondary"],
    warning: ["warning", "secondary"],      
    danger:  ["danger", "secondary"]
  }
  return (
    <ToastContainer position="top-center" className="p-3">
      <Toast bg={variant} show={show} onClose={onClose} autohide={false}>
        <Toast.Header closeButton>
          <strong className="me-auto">{header}</strong>
        </Toast.Header>

        <Toast.Body className="text-dark">
          {body}
          <div className="d-flex justify-content-end gap-2">
            <Button
              size="sm"
              variant={BUTTON_VARIANT[variant][0]}
              onClick={onCancel}
            >
              Não
            </Button>

            <Button
              size="sm"
              variant={BUTTON_VARIANT[variant][1]}
              onClick={onConfirm}
            >
              Sim
            </Button>
          </div>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
