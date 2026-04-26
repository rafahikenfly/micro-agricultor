import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import { dispositivosService } from "../../../services/crudService";
import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import DispositivoModal from "./DispositivoModal";
import { VARIANTE } from "micro-agricultor";


export default function DispositivosCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = dispositivosService.subscribe((data) => {
      setDispositivos(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: dispositivosService,
    nomeEntidade: "dispositivo",
    masculino: true, // "o dispositivo"
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
          <Button variant="outline-success" onClick={criar}>+ Novo Dispositivo</Button>
        </Col>
      </Row>

      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaComAcoes
            dados = {dispositivos}
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

      <DispositivoModal
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