import { useEffect, useState } from "react";
import { Badge, Button, Col, Container, Row } from "react-bootstrap";
import EstagiosEspecieModal from "./EstagiosEspecieModal";
import { VARIANTE } from "micro-agricultor";
import { NoUser } from "../../../components/common/NoUser";
import Loading from "../../../components/Loading";
import { useCrudUI } from "../../../services/ui/crudUI";
import { estagiosEspecieService } from "../../../services/crudService";
import { useAuth } from "../../../services/auth/authContext";
import ListaComAcoes from "../../../components/common/ListaComAcoes";
import { renderBadge } from "../../../utils/uiUtils";


export default function EstagiosEspecieCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [estagiosEspecie, setEstagiosEspecie] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = estagiosEspecieService.subscribe((data) => {
      setEstagiosEspecie(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: estagiosEspecieService,
    nomeEntidade: "estágios de espécie",
    masculino: true, // "o estágio de especie"
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
          <Button variant="outline-success" onClick={criar}>+ Novo Estágio de Espécie</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <ListaComAcoes
            dados = {estagiosEspecie}
            sort
            colunas = {[
              {rotulo: "Nome", dataKey: "nome", render: (a)=>renderBadge(a,"nome")},
            ]}
            acoes = {[
              {rotulo: "📝", funcao: editar, variant:VARIANTE.YELLOW.variant},
              {rotulo: "⧉", funcao: duplicar, variant: VARIANTE.GREY.variant},
              {rotulo: "🗑️", funcao: apagarComConfirmacao, variant: VARIANTE.RED.variant},
              { toggle: "isArchived",
                rotulo: "💤",
                rotuloFalse: "⚡",
                funcao: desarquivar,
                funcaoFalse: arquivar,
                variant: VARIANTE.GREY.variant,
              },
            ]}
          />
        </Col>
      </Row>

      <EstagiosEspecieModal
        key={editando?.id ?? `novo`}
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