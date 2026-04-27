import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { AMBIENTE, VARIANTE } from "micro-agricultor";

import UsuarioModal from "./UsuarioModal"
import { useAuth } from "../../../services/auth/authContext";
import { NoUser } from "../../../components/common/NoUser";
import { usuariosService } from "../../../services/crudService";
import { useCrudUI } from "../../../services/ui/crudUI";
import Loading from "../../../components/Loading";
import ListaComAcoes from "../../../components/common/ListaComAcoes";
import { renderBadge, renderBadgeGroup } from "../../../utils/uiUtils";


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
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: usuariosService,
    nomeEntidade: "usuário",
    masculino: true, // "o usuário"
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
          <Button variant="outline-success" onClick={criar}>+ Novo Usuário</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <ListaComAcoes
            dados = {usuarios}
            sort
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Acessos", dataKey: "acesso", render: (a)=>renderBadgeGroup(a, "acesso", AMBIENTE)},
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

      <UsuarioModal
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