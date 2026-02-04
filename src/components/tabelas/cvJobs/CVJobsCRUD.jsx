import React, { useEffect, useState } from "react";

import ListaAcoes from "../../common/ListaAcoes";
import { AppToastMensagem, AppToastConfirmacao } from "../../common/toast";
import { Container, Row, Col, Button, } from "react-bootstrap";
import { useCrudUI } from "../../../services/ui/crudUI";
import { cvJobsService } from "../../../services/crud/cvJobsService";
import CVJobsModal from "./CVJobsModal";
import { useAuth } from "../../../services/auth/authContext";
import { NoUser } from "../../common/NoUser";

function CVJobsCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [cvJobs, setCVJobs] = useState([]);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showToastMensagem, setShowToastMensagem] = useState(false);
  const [showToastConfirmacao, setShowToastConfirmacao] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    const unsub = cvJobsService.subscribe(setCVJobs);
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
    showToast(`Confirma a exclusão do manejo ${data.nome}?`, "danger", true, apagar);
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
  } = useCrudUI({
    crudService: cvJobsService,
    nomeEntidade: "tarefa de visão computacional",
    masculino: false, // "o estado de planta"
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
          <Button onClick={criar}>+ Nova Tarefa de Visão Computacional</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {/* ================= LISTA ================= */}
          <ListaAcoes
            dados={cvJobs}
            campos={[
              { rotulo: "Nome", data: "nome" },
              { rotulo: "Descrição", data: "descricao" },
              { rotulo: "Apagado",   data: "isDeleted",  boolean: true},
            ]}
            acoes={[
              { rotulo: "Editar", funcao: editar, variant: "warning" },
              { rotulo: "Excluir", funcao: confirmarExclusao, variant: "danger" },
              { toggle: "isArchived",
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
      <CVJobsModal
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

export default CVJobsCRUD;
