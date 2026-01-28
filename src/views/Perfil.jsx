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
import { useAuth } from "../services/auth/authContext";
import { db, timestamp } from "../firebase";

import UsuarioDadosTab from "../components/usuarios/UsuarioDadosTab";
import UsuarioPreferenciasTab from "../components/usuarios/UsuarioPreferenciasTab";
import { AppToastConfirmacao, AppToastMensagem } from "../components/common/toast";
import UsuarioAcessosTab from "../components/usuarios/UsuarioAcessosTab";
import UsuarioAmbienteTab from "../components/actions/UsuarioAmbienteTab";

export default function Perfil() {
  const { user, login, logout } = useAuth();
  const [tab, setTab] = useState("usuario");
  const [editando, setSaving] = useState(false);

  const [showToastMensagem, setShowToastMensagem] = useState(false);
  const [showToastConfirmacao, setShowToastConfirmacao] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("success");


  const [form, setForm] = useState({
    nome: "",
    apelido: "",
    email: "",
    ambienteAtivo: "",
  });
  const [acessos, setAcessos] = useState({
    admin: false,
    usuario: true,
  });

  /* =================== EFFECTS =================== */
  useEffect(() => {
    if (!user) return;

    setForm({
      nome: user.nome ?? "",
      descricao: user.descricao ?? "",
      apelido: user.apelido ?? "",
      email: user.email ?? "",
      ambienteAtivo: user.ambienteAtivo ?? "",
    });
    setAcessos({
      admin: user.acessos?.admin || false,
      usuario: user.acessos?.usuario ?? true,
    });
  }, [user]);

  /* =================== HANDLERS =================== */
  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    if (!user) return;

    setForm({
      nome: user.nome ?? "",
      descricao: user.descricao ?? "",
      apelido: user.apelido ?? "",
      email: user.email ?? "",
      ambienteAtivo: user.ambienteAtivo ?? "",
    });
    setAcessos({
      admin: user.acessos?.admin || false,
      usuario: user.acessos?.usuario ?? true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    await db.collection("usuarios").doc(user.id).update({
      ...form,
      acessos: acessos,
      updatedAt: timestamp(),
    });

    login({
      ...user,
      ...form,
      acessos,
    });

    setSaving(false);
  };
  /* ================= TOAST/MODAL ================= */
  const showToast = (msg, variant = "success", confirmacao = false) => {
    setToastMsg(msg);
    setToastVariant(variant);
    setShowToastMensagem(!confirmacao);
    setShowToastConfirmacao(confirmacao);
  };

  const confirmarLogout = () => {
    showToast(`Realmente deseja sair?`, "danger", true,);
  };
  
  const cancelarLogout = () => {
    setShowToastConfirmacao(false);
  };

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
                  onChange={handleFieldChange}
                />
              </Tab>
              <Tab eventKey="acessos" title="Acessos">
                <UsuarioAcessosTab
                  acessos={acessos}
                  setAcessos={setAcessos}
                />
              </Tab>
              <Tab eventKey="preferencias" title="Preferências">
                <UsuarioPreferenciasTab />
              </Tab>
              <Tab eventKey="ambiente" title="Ambiente">
                <UsuarioAmbienteTab
                  acessos={acessos}
                  ambienteAtivo={form.ambienteAtivo}
                  onSelect={(ambiente)=>handleFieldChange("ambienteAtivo",ambiente)}
                />
              </Tab>
            </Tabs>
          </Card.Body>

          <Card.Footer>
            <Stack direction="horizontal" gap={2} className="justify-content-end">
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={editando}
              >
                Cancelar
              </Button>

              <Button variant="success" type="submit" disabled={editando}>
                {editando && (
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

      {/* ================= TOASTS ================= */}
      <AppToastMensagem
        show={showToastMensagem}
        onClose={() => setShowToastMensagem(false)}
        message={toastMsg}
        variant={toastVariant}
      />

      <AppToastConfirmacao
        show={showToastConfirmacao}
        onCancel={cancelarLogout}
        onConfirm={logout}
        message={toastMsg}
        variant={toastVariant}
      />

    </Container>
  );
}
