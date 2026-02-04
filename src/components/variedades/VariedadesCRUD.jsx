import React, { useEffect, useState } from "react";

import ListaAcoes from "../common/ListaAcoes";
import { AppToastMensagem, AppToastConfirmacao } from "../common/toast";
import { Container, Row, Col, Button, } from "react-bootstrap";
import { variedadesService } from "../../services/crud/variedadesService";
import { db } from "../../firebase";
import VariedadesModal from "./VariedadesModal";
import { useCrudUI } from "../../services/ui/crudUI";
import { NoUser } from "../common/NoUser";
import { useAuth } from "../../services/auth/authContext";

function VariedadesCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [variedades, setVariedades] = useState([]);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showToastMensagem, setShowToastMensagem] = useState(false);
  const [showToastConfirmacao, setShowToastConfirmacao] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    const unsub = variedadesService.subscribe(setVariedades);
    return unsub;
  }, []);

  /* ================= TOAST/MODAL ================= */
  const showToast = (msg, variant = "success", confirmacao = false) => {
    setToastMsg(msg);
    setToastVariant(variant);
    setShowToastMensagem(!confirmacao);
    setShowToastConfirmacao(confirmacao);
  };

  const confirmarExclusao = (data) => {
    setRegistroParaExcluir(data);
    showToast(`Confirma a exclusão da variedade ${data.nome}?`, "warning", true);
  };
  
  const cancelarExclusao = () => {
    setRegistroParaExcluir(null);
    setShowToastConfirmacao(false);
  };

  /* ================= CRUD ================= */
  const {
    criar,
    editar,
    atualizar,
    apagar,
    arquivar,
    desarquivar,
  } = useCrudUI ({
    crudService: variedadesService,
    nomeEntidade: "variedade",
    masculino: false, // "a variedade"
    user,
  
    editando,
    setEditando,
    setShowModal,
    registroParaExcluir,
    cancelarExclusao,
  
    showToast,
  });
  

  /* ================= RENDER ================= */
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Button onClick={criar}>+ Nova Variedade</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {/* ================= LISTA ================= */}
          <ListaAcoes
            dados={variedades}
            campos={[
              { rotulo: "Nome", data: "nome" },
              { rotulo: "Espécie", data: "especieNome" },
              { rotulo: "Apagado", data: "isDeleted", boolean: true },
            ]}
            acoes={[
              { rotulo: "Editar", funcao: editar, variant: "warning" },
              { rotulo: "Excluir", funcao: confirmarExclusao, variant: "danger" },
              {toggle: "isArchived",
                rotulo: "Desarquivar",
                funcao: desarquivar,
                variant: "secondary",
                rotuloFalse: "Arquivar",
                funcaoFalse: arquivar,
                variantFalse: "dark"
              },
            ]}
          />
        </Col>
      </Row>

      {/* ================= MODAL ================= */}
      <VariedadesModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditando(null);
        }}
        onSave={atualizar}
        data={editando}
      />

      {/* ================= TOASTS ================= */}
      <AppToastMensagem
        show={showToastMensagem}
        onClose={() => setShowToastMensagem(false)}
        message={toastMsg}
        variant={toastVariant}
      />

      <AppToastConfirmacao
        show={showToastConfirmacao}
        onCancel={cancelarExclusao}
        onConfirm={apagar}
        message={toastMsg}
        variant={toastVariant}
      />

    </Container>
  );
}

export default VariedadesCRUD;