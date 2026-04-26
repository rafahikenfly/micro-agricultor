import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import { hortasService } from "../../../services/crudService";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useAuth } from "../../../services/auth/authContext";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import { NoUser } from "../../../components/common/NoUser";

import HortaModal from "./HortaModal";
import { VARIANTE } from "micro-agricultor";
import Loading from "../../../components/Loading";
import { calcularArea } from "../../../utils/geometryUtils";


export default function HortasCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [hortas, setHortas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = hortasService.subscribe((data) => {
      setHortas(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: hortasService,
    nomeEntidade: "horta",
    masculino: false, // "a horta"
    user,
    editando,
    registroParaExcluir,
    setEditando,
    setShowModal,
    setRegistroParaExcluir,
  });

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Button variant="outline-success" onClick={criar}>+ Nova horta</Button>
        </Col>
      </Row>

      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaComAcoes
            dados = {hortas}
            sort
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Área", dataKey: "area", render: (a)=>`${(calcularArea(a)/10000).toFixed(2)}m²`},
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

      <HortaModal
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