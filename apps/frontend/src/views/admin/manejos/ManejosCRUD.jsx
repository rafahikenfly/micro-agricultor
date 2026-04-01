import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { ENTIDADE } from "micro-agricultor";

import { manejoService } from "../../../services/crud/manejoService";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useAuth } from "../../../services/auth/authContext";

import { NoUser } from "../../../components/common/NoUser";
import ListaAcoes from "../../../components/common/ListaAcoes";
import Loading from "../../../components/Loading";

import ManejoModal from "./ManejoModal";

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

    const unsub = manejoService.subscribe((data) => {
      setManejos(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: manejoService,
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
          <ListaAcoes
            dados = {manejos}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Aplicável à", dataKey: "aplicavel", tagVariantList: Object.values(ENTIDADE)},
              {rotulo: "Apagado", dataKey: "isDeleted", boolean: true },
              
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
