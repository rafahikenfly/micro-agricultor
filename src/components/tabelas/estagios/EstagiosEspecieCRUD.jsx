import React, { useEffect, useState } from "react";

import ListaAcoes from "../../common/ListaAcoes";
import { AppToastMensagem, AppToastConfirmacao } from "../../common/toast";
import { Container, Row, Col, Button, } from "react-bootstrap";
import { estagiosPlantaService } from "../../../services/crud/estagiosPlantaService";
import EstagiosEspecieModal from "./EstagiosEspecieModal";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useAuth } from "../../../services/auth/authContext";
import { NoUser } from "../../common/NoUser";

function EstagiosEspecieCRUD() {
    const { user } = useAuth();
    if (!user) return <NoUser />
  
  const [estagiosPlanta, setEstagiosPlanta] = useState([]);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showToastMensagem, setShowToastMensagem] = useState(false);
  const [showToastConfirmacao, setShowToastConfirmacao] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    const unsub = estagiosPlantaService.subscribe(setEstagiosPlanta);
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
    showToast(`Confirma a exclusão do estágio de planta ${data.nome}?`, "danger", true, apagar);
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
    crudService: estagiosPlantaService,
    nomeEntidade: "estágio",
    masculino: true, // "o estágio"
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
          <Button onClick={criar}>+ Novo Estágio de Planta</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {/* ================= LISTA ================= */}
          <ListaAcoes
            dados={estagiosPlanta}
            campos={[
              { rotulo: "Nome", data: "nome" },
              { rotulo: "Descrição", data: "descricao" }
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
                variantFalse: "light"
              },
            ]}
          />
        </Col>
      </Row>

      {/* ================= MODAL ================= */}
      <EstagiosEspecieModal
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

export default EstagiosEspecieCRUD;