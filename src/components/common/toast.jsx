import React from "react";
import {
  Button, Toast,
  ToastContainer
} from "react-bootstrap";

/* ================= TOASTS ================= */
export function AppToastMensagem({ show, onClose, message, variant }) {
  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast bg={variant} show={show} onClose={onClose} delay={3000} autohide>
        <Toast.Header closeButton>
          <strong className="me-auto">
            {variant === "success" ? "Sucesso" : "Erro"}
          </strong>
        </Toast.Header>
        <Toast.Body className="text-white">
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
export function AppToastConfirmacao({ show, onClose, message, variant, onConfirm, onCancel }) {
  return (
    <ToastContainer position="bottom-end" className="p-3">
      <Toast bg={variant} show={show} onClose={onClose} autohide={false}>
        <Toast.Header closeButton>
          <strong className="me-auto">{message}</strong>
        </Toast.Header>

        <Toast.Body className="text-dark">
          <div className="d-flex justify-content-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onCancel}
            >
              Não
            </Button>

            <Button
              size="sm"
              variant="danger"
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
