import React, { useEffect, useState } from "react";

import ListaAcoes from "../common/ListaAcoes";
import { AppToastMensagem, AppToastConfirmacao } from "../common/toast";
import { Container, Row, Col, Button, } from "react-bootstrap";
import { especiesService } from "../../services/crud/especiesService";
import EspeciesModal from "./EspeciesModal";
import { db } from "../../firebase";
import { useCrudUI } from "../../services/ui/crudUI";
import { NoUser } from "../common/NoUser";

function EspeciesCRUD({ user }) {
  if (!user) return <NoUser/>

  const [especies, setEspecies] = useState([]);
  const [estagiosEspecie, setEstagiosEspecie] = useState([]);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showToastMensagem, setShowToastMensagem] = useState(false);
  const [showToastConfirmacao, setShowToastConfirmacao] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    const unsub = especiesService.subscribe(setEspecies);
    return unsub;
  }, []);

  useEffect(() => {
    return db.collection("estagios_planta") //TODO: ARRUMAR A SEMANTICA DA COLECAO ==> ESTAGIOS_ESPECIE
      .orderBy("nome")
      .onSnapshot(s =>
        setEstagiosEspecie(s.docs.map(d => ({ id: d.id, ...d.data() })))
      );
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
    showToast(`Confirma a exclusão da espécie ${data.nome}?`, "danger", true, apagar);
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
    crudService: especiesService,
    nomeEntidade: "espécie",
    masculino: false,
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
          <Button onClick={criar}>+ Nova Espécie</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {/* ================= LISTA ================= */}
          <ListaAcoes
            dados={especies}
            campos={[
              { rotulo: "Nome", data: "nome" },
              { rotulo: "Categoria", data: "categoriaNome" },
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
      <EspeciesModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditando(null);
        }}
        onSave={atualizar}
        data={editando}
        estagiosEspecie={estagiosEspecie}
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

export default EspeciesCRUD;