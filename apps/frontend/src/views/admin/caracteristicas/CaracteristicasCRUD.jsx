import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { VARIANTE, ENTIDADE } from "micro-agricultor";


import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";


import { caracteristicasService } from "../../../services/crudService";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useAuth } from "../../../services/auth/authContext";

import CaracteristicaModal from "./CaracteristicaModal";
import { renderBadge, renderBadgeGroup } from "../../../utils/uiUtils";

export default function CaracteristicasCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = caracteristicasService.subscribe((data) => {
      setCaracteristicas(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: caracteristicasService,
    nomeEntidade: "característica",
    masculino: false, // "a característica"
    user,
    editando,
    registroParaExcluir,
    setEditando,
    setShowModal,
    setRegistroParaExcluir,
  });
  /* ================= RENDER ================= */
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Button variant="outline-success" onClick={criar}>+ Nova Característica</Button>
        </Col>
      </Row>

      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaComAcoes
            dados = {caracteristicas}
            sort
            colunas = {[
              {rotulo: "Nome", dataKey: "nome", render: (a)=> renderBadge (a, "nome")},
              {rotulo: "Aplicável à", dataKey: "aplicavel", render: (a)=>renderBadgeGroup(a, "aplicavel", ENTIDADE) }
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

      <CaracteristicaModal
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