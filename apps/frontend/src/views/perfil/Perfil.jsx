import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Tabs,
  Tab,
  Stack,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../../services/auth/authContext";
import { db, timestamp } from "../../firebase";

import UsuarioDadosTab from "../../components/usuarios/UsuarioDadosTab";
import UsuarioPreferenciasTab from "./UsuarioPreferenciasTab";
import UsuarioHortasTab from "./UsuarioPreferenciasTab";

import {
  AppToastConfirmacao,
  AppToastMensagem,
} from "../../components/common/toast";

import { validarUsuario } from "@domain/usuarios.rules";

export default function Perfil() {
  const { user, logout } = useAuth();

  const [tab, setTab] = useState("usuario");
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState({});

  const [form, setForm] = useState(null);

  /* =================== EFFECT =================== */
  useEffect(() => {
    if (!user) return;
    setForm(validarUsuario(user));
  }, [user]);

  /* =================== HANDLERS =================== */

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    if (!user) return;
    setForm(validarUsuario(user));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSalvando(true);

      await db.collection("usuarios").doc(user.uid).update({
        ...form,
        updatedAt: timestamp(),
      });

      setToast({
        show: true,
        body: "Perfil atualizado com sucesso.",
        variant: "success",
      });
    } catch (err) {
      setToast({
        show: true,
        body: "Erro ao atualizar perfil.",
        variant: "danger",
      });
    }

    setSalvando(false);
  };

  const confirmarLogout = () => {
    setToast({
      show: true,
      header: "Sair",
      body: "Realmente deseja sair?",
      variant: "warning",
      confirmacao: true,
      onCancel: () => setToast({ show: false }),
      onConfirm: logout,
    });
  };

  if (!form) return null;

  /* =================== RENDER =================== */
  return (
    <Container style={{ maxWidth: 800 }}>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">Perfil</Card.Title>

          <Button
            variant="outline-danger"
            size="sm"
            onClick={confirmarLogout}
          >
            Sair
          </Button>
        </Card.Header>

        <Form onSubmit={handleSubmit}>
          <Card.Body>
            <Tabs
              activeKey={tab}
              onSelect={setTab}
              className="mb-3"
              mountOnEnter
              unmountOnExit
            >
              <Tab eventKey="usuario" title="Usuário">
                <UsuarioDadosTab
                  form={form}
                  setForm={setForm}
                />
              </Tab>

              <Tab eventKey="preferencias" title="Preferências">
                <UsuarioPreferenciasTab />
              </Tab>

              <Tab eventKey="ambiente" title="Hortas">
                <UsuarioHortasTab />
              </Tab>
            </Tabs>
          </Card.Body>

          <Card.Footer>
            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-end"
            >
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={salvando}
              >
                Cancelar
              </Button>

              <Button
                variant="success"
                type="submit"
                disabled={salvando}
              >
                {salvando && (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                )}
                Salvar
              </Button>
            </Stack>
          </Card.Footer>
        </Form>
      </Card>

      {/* ===== Toast Mensagem ===== */}
      <AppToastMensagem
        show={toast.show && !toast.confirmacao}
        onClose={() =>
          setToast((prev) => ({ ...prev, show: false }))
        }
        body={toast.body}
        variant={toast.variant}
      />

      {/* ===== Toast Confirmação ===== */}
      <AppToastConfirmacao
        show={toast.show && toast.confirmacao}
        onCancel={toast.onCancel}
        onConfirm={toast.onConfirm}
        body={toast.body}
        variant={toast.variant}
      />
    </Container>
  );
}