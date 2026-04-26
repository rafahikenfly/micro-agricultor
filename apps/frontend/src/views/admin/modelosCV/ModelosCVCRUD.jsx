import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { modelosCVService } from "../../../services/crudService";
import CvModeloModal from "./CvModeloModal";
import { useAuth } from "../../../services/auth/authContext";
import { NoUser } from "../../../components/common/NoUser";
import Loading from "../../../components/Loading";
import ListaComAcoes from "../../../components/common/ListaComAcoes";
import { useCrudUI } from "../../../services/ui/crudUI";
import { VARIANTE } from "micro-agricultor";


export default function ModelosCVCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [cvModelos, setCvModelos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState({});

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = modelosCVService.subscribe((data) => {
      setCvModelos(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: modelosCVService,
    nomeEntidade: "modelo de CV",
    masculino: true, // "o modelo"
    user,
    editando,
    registroParaExcluir,
    setEditando,
    setShowModal,
    setRegistroParaExcluir,
  });
  /* ================= RENDER ================= */
  if (loading) return <Loading variant="inline"/>
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Button variant="outline-success" onClick={criar}>+ Novo Modelo de Visão Computacional</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <ListaComAcoes
            dados = {cvModelos}
            sort
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
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

      <CvModeloModal
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