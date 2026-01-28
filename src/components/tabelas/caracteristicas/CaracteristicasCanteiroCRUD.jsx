import React, { useEffect, useState } from "react";

import ListaAcoes from "../../common/ListaAcoes";
import { AppToastMensagem, AppToastConfirmacao } from "../../common/toast";
import { Container, Row, Col, Button, } from "react-bootstrap";
import { caracteristicasCanteiroService } from "../../../services/crud/caracteristicasCanteirosService";
import CaracteristicasCanteiroModal from "./CaracteristicasCanteiroModal";
import { useCrudUI } from "../../../services/ui/crudUI";
import { NoUser } from "../../common/NoUser";
import { useAuth } from "../../../services/auth/authContext";

function CaracteristicasCanteiroCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  
  const [caracteristicasCanteiro, setCaracteristicasCanteiro] = useState([]);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showToastMensagem, setShowToastMensagem] = useState(false);
  const [showToastConfirmacao, setShowToastConfirmacao] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    const unsub = caracteristicasCanteiroService.subscribe(setCaracteristicasCanteiro);
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
    showToast(`Confirma a exclusão do estágio de canteiro ${data.nome}?`, "danger", true, apagar);
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
    crudService: caracteristicasCanteiroService,
    nomeEntidade: "característica de canteiro",
    masculino: false, // "a característica de planta"
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
          <Button onClick={criar}>+ Nova Característica</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {/* ================= LISTA ================= */}
          <ListaAcoes
            dados={caracteristicasCanteiro}
            campos={[
              { rotulo: "Nome", data: "nome" },
              { rotulo: "Descrição", data: "descricao" },
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
                variantFalse: "light"
              },
            ]}
          />
        </Col>
      </Row>

      {/* ================= MODAL ================= */}
      <CaracteristicasCanteiroModal
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

export default CaracteristicasCanteiroCRUD;