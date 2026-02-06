import { useEffect, useState } from "react";
import { usuariosService } from "../../services/crud/usuariosService";
import UsuarioModal from "./UsuarioModal"
import ListaAcoes from "../common/ListaAcoes";
import Loading from "../common/Loading";
import { AppToastConfirmacao, AppToastMensagem } from "../common/toast";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useCrudUI } from "../../services/ui/crudUI";
import { NoUser } from "../common/NoUser";
import { useAuth } from "../../services/auth/authContext";
import { setToast } from "../../services/ui/toast";
import { TIPOS_ACESSO } from "../../utils/consts/TIPOS_ACESSO";


export default function UsuariosCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState({});

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = usuariosService.subscribe((data) => {
      setUsuarios(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const {
    criar,
    editar,
    atualizar,
    arquivar,
    desarquivar,
    apagarComConfirmacao,
  } = useCrudUI({
    crudService: usuariosService,
    nomeEntidade: "usuarios",
    masculino: true, // "o usuario"
    user,
  
    editando,
    registroParaExcluir,
    
    setEditando,
    setShowModal,
    setRegistroParaExcluir,
    setShowToast,
  });
  /* ================= RENDER ================= */
  if (loading) return <Loading />
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Button variant="outline-success" onClick={criar}>+ Novo Usuário</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <ListaAcoes
            dados = {usuarios}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Acessos", dataKey: "acesso", tagVariantList: TIPOS_ACESSO},
              {rotulo: "Apagado",   dataKey: "isDeleted",  boolean: true},
            ]}
            acoes = {[
              {rotulo: "Editar", funcao: editar, variant: "warning"},
              {rotulo: "Excluir", funcao: apagarComConfirmacao, variant: "danger"},
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

      <UsuarioModal
        key={editando ? editando.id : `novo`}
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditando(null);
        }}
        onSave={atualizar}
        data={editando}
        setToast={(toast) => setToast(toast, setShowToast)}
      />
      {/* ======= TOAST MENSAGEM E CONFIRMACAO ========= */}
      <AppToastMensagem
        show={showToast.show && !showToast.confirmacao}
        onClose={() => setShowToast(prev => ({ ...prev, show: false }))}
        body={showToast.body}
        variant={showToast.variant}
      />
      <AppToastConfirmacao
        show={showToast.show && showToast.confirmacao}
        onCancel={showToast.onCancel}
        onConfirm={showToast.onConfirm}
        body={showToast.body}
        variant={showToast.variant}
      />

    </Container>
  );
}