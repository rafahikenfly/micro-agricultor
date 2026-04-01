import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import { canteirosService } from "../../../services/crud/canteirosService";
import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useCache } from "../../../hooks/useCache";

import ListaAcoes from "../../../components/common/ListaAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import CanteiroModal from "./CanteiroModal";


export default function CanteirosCRUD() {
  const { user } = useAuth();
  const { cacheEstadosCanteiro, reading } = useCache([
    "estadosCanteiro"
  ]);

  if (!user) return <NoUser />

  const [canteiros, setCanteiros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = canteirosService.subscribe((data) => {
      setCanteiros(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: canteirosService,
    nomeEntidade: "canteiro",
    masculino: true, // "o canteiro"
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
          <Button variant="outline-success" onClick={criar}>+ Novo canteiro</Button>
        </Col>
      </Row>

      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaAcoes
            dados = {canteiros}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Horta", dataKey: "hortaNome",},
              {rotulo: "Estado", dataKey: "estadoId", tagVariantList: cacheEstadosCanteiro?.map ?? {},},
              {rotulo: "Apagado", dataKey: "isDeleted",  boolean: true},
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

      <CanteiroModal
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