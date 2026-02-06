import { useEffect, useState } from "react";
import { categoriasEspecieService } from "../../../services/crud/categoriasService";
import CategoriaModal from "./CategoriaModal";
import ListaAcoes from "../../common/ListaAcoes";
import Loading from "../../common/Loading";
import { AppToastConfirmacao, AppToastMensagem } from "../../common/toast";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useCrudUI } from "../../../services/ui/crudUI";
import { NoUser } from "../../common/NoUser";
import { useAuth } from "../../../services/auth/authContext";
import { setToast } from "../../../services/ui/toast";
import { VARIANTS } from "../../../utils/consts/VARIANTS";

export default function CategoriasCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState({});

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = categoriasEspecieService.subscribe((data) => {
      setCategorias(data);
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
    crudService: categoriasEspecieService,
    nomeEntidade: "categoria",
    masculino: false, // "a categoria"
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
          <Button variant="outline-success" onClick={criar}>+ Nova Categoria</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <ListaAcoes
            dados = {categorias}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Cor da Tag", dataKey: "tagVariant", tagVariantList: VARIANTS},
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

      <CategoriaModal
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