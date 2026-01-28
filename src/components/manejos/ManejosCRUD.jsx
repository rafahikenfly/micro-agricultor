import { useEffect, useState } from "react";
import { manejoService } from "../../services/crud/manejoService";
import ManejoModal from "./ManejoModal";
import ListaAcoes from "../common/ListaAcoes";
import { AppToastConfirmacao, AppToastMensagem } from "../common/toast";
import { Button, Col, Container, Row } from "react-bootstrap";
import { db } from "../../firebase";
import { useCrudUI } from "../../services/ui/crudUI";
import { NoUser } from "../common/NoUser";
import { useAuth } from "../../services/auth/authContext";


export default function ManejosCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [manejos, setManejos] = useState([]);
  const [estadosCanteiro, setEstadosCanteiro] = useState([]);
  const [estadosPlanta, setEstadosPlanta] = useState([]);
  const [parametros, setParametros] = useState([]);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showToastMensagem, setShowToastMensagem] = useState(false);
  const [showToastConfirmacao, setShowToastConfirmacao] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("success");



  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    const unsub = manejoService.subscribe(setManejos);
    return unsub;
  }, []);

  useEffect(() => {
    return db.collection("estados_planta")
      .orderBy("nome")
      .onSnapshot(s =>
        setEstadosPlanta(s.docs.map(d => ({ id: d.id, ...d.data() })))
      );
  }, []);

  useEffect(() => {
    return db.collection("estados_canteiro")
      .orderBy("nome")
      .onSnapshot(s =>
        setEstadosCanteiro(s.docs.map(d => ({ id: d.id, ...d.data() })))
      );
  }, []);

  useEffect(() => {
    return db.collection("parametros")
      .orderBy("nome")
      .onSnapshot(s =>
        setParametros(s.docs.map(d => ({ id: d.id, ...d.data() })))
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
    crudService: manejoService,
    nomeEntidade: "manejo",
    masculino: true, // "o manejo"
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
          <Button onClick={criar}>+ Novo manejo</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <ListaAcoes
            dados = {manejos}
            campos = {[
              {rotulo: "Nome", data: "nome",},
              {rotulo: "Aplicável à", data: "tipoEntidade",},
              {rotulo: "Apagado", data: "isDeleted", boolean: true },
            ]}
            acoes = {[
              {rotulo: "Editar", funcao: editar, variant: "warning"},
              {rotulo: "Excluir", funcao: confirmarExclusao, variant: "danger"},
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

      <ManejoModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditando(null);
        }}
        onSave={atualizar}
        data={editando}
        parametros={parametros}
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
