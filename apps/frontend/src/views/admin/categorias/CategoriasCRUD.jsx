import { useEffect, useState } from "react";
import { categoriasEspecieService } from "../../../services/crudService";
import CategoriaModal from "./CategoriaModal";
import ListaComAcoes from "../../../components/common/ListaComAcoes";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useCrudUI } from "../../../services/ui/crudUI";
import { NoUser } from "../../../components/common/NoUser";
import { useAuth } from "../../../services/auth/authContext";
import Loading from "../../../components/Loading";
import { VARIANTE } from "micro-agricultor";
import { renderBadge } from "../../../utils/uiUtils";

export default function CategoriasCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);
  
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
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: categoriasEspecieService,
    nomeEntidade: "categoria",
    masculino: false, // "a categoria"
    user,
    editando,
    registroParaExcluir,
    setEditando,
    setShowModal,
    setRegistroParaExcluir,
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
          <ListaComAcoes
            dados = {categorias}
            sort
            colunas = {[
              {rotulo: "Nome", dataKey: "nome", render: (a)=> renderBadge (a, "nome")},
            ]}
            acoes = {[
              {rotulo: "📝", funcao: editar, variant:VARIANTE.YELLOW.variant.id},
              {rotulo: "⧉", funcao: duplicar, variant: VARIANTE.GREY.variant.id},
              {rotulo: "🗑️", funcao: apagarComConfirmacao, variant: VARIANTE.RED.variant.id},
              { toggle: "isArchived",
                rotulo: "💤",
                rotuloFalse: "⚡",
                funcao: desarquivar,
                funcaoFalse: arquivar,
                variant: VARIANTE.GREY.variant.id,
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
      />
    </Container>
  );
}