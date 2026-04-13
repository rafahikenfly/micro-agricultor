import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import { variedadesService } from "../../../services/crud/variedadesService";
import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import VariedadeModal from "./VariedadeModal";
import { useCache } from "../../../hooks/useCache";


export default function VariedadesCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />
  const { cacheEspecies, reading } = useCache(["especies"]);
  

  const [variedades, setVariedades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  // Assinatura
  useEffect(() => {
    setLoading(true);

    const unsub = variedadesService.subscribe((data) => {
      setVariedades(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: variedadesService,
    nomeEntidade: "variedade",
    masculino: false, // "a variedade"
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
          <Button variant="outline-success" onClick={criar}>+ Nova variedade</Button>
        </Col>
      </Row>

      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaComAcoes
            dados = {variedades}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome" },
              {rotulo: "Espécie", dataKey: "especieId", render: (a) => cacheEspecies?.map.get(a.especieId).nome },
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

      <VariedadeModal
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