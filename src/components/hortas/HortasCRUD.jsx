import React, { useEffect, useState } from "react";
import { hortaService } from "../../services/crud/hortaService";
import HortaModal from "./HortaModal";
import { db } from "../../firebase";
import { Button, Col, Container, Row } from "react-bootstrap";
import ListaAcoes from "../common/ListaAcoes";
import { AppToastConfirmacao, AppToastMensagem } from "../common/toast";
import { useCrudUI } from "../../services/ui/crudUI";

export default function HortasCRUD({user = {id: "teste", usuario: "rafael"}}) {
  const [hortas, setHortas] = useState([]);
  const [climas, setClimas] = useState([]);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [showToastMensagem, setShowToastMensagem] = useState(false);
  const [showToastConfirmacao, setShowToastConfirmacao] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("success");



  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    const unsub = hortaService.subscribe(setHortas);
    return unsub;
  }, []);

  useEffect(() => {
    return db.collection("climas_hortas")
      .orderBy("nome")
      .onSnapshot(s =>
        setClimas(s.docs.map(d => ({ id: d.id, ...d.data() })))
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
    showToast(`Confirma a exclusão da horta ${data.nome}?`, "danger", true, apagar);
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
    crudService: hortaService,
    nomeEntidade: "horta",
    masculino: true,
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
          <Button onClick={criar}>+ Nova Horta</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <ListaAcoes 
            dados = {hortas}
            campos = {[
              {rotulo: "Nome", data: "nome",},
              {rotulo: "Clima", data: "climaNome",},
            ]}
            acoes = {[
              {rotulo: "Editar", funcao: editar, variant: "warning"},
              {rotulo: "Excluir", funcao: confirmarExclusao, variant: "danger"},
              {toggle: "isArchived",
                rotulo: "Arquivar",
                funcao: arquivar,
                variant: "dark",
                rotuloFalse: "Desarquivar",
                funcaoFalse: desarquivar,
                variantFalse: "secondary"
              },
            ]}
          />
        </Col>
      </Row>

      <HortaModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditando(null);
        }}
        onSave={atualizar}
        data={editando}
        climas={climas}
      />

      {/* ======= TOAST MENSAGEM E CONFIRMACAO ========= */}
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
