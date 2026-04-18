import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { ENTIDADE } from "micro-agricultor";

import { useCrudUI } from "../../../services/ui/crudUI";
import { useAuth } from "../../../services/auth/authContext";

import { NoUser } from "../../../components/common/NoUser";
import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";

import ManejoModal from "./ManejoModal";
import { manejosService } from "../../../services/crudService";

export default function ManejosCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [manejos, setManejos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = manejosService.subscribe((data) => {
      setManejos(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: manejosService,
    nomeEntidade: "manejo",
    masculino: true, // "o manejo"
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
          <Button variant="outline-success" onClick={criar}>+ Novo manejo</Button>
        </Col>
      </Row>

      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaComAcoes
            dados = {manejos}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Aplicável à", dataKey: "aplicavel", tagVariantList: Object.values(ENTIDADE)},              
            ]}
            acoes = {[
              {rotulo: "Editar", funcao: editar, variant: "warning"},
              {rotulo: "Excluir", funcao: apagarComConfirmacao, variant: "danger"},
              { toggle: "isArchived",
                rotulo: "Desarquivar",
                rotuloFalse: "Arquivar",
                funcao: desarquivar,
                funcaoFalse: arquivar,
                variant: "secondary",
              },
            ]}
          />
        </Col>
      </Row>

      <ManejoModal
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
