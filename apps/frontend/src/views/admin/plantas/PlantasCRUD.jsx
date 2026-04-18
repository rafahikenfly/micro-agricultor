import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import { plantasService } from "../../../services/crudService";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useAuth } from "../../../services/auth/authContext";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import PlantaModal from "./PlantaModal";
import { useCache } from "../../../hooks/useCache";


export default function PlantasCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);

  const { cacheEstadosPlanta, cacheEstagiosEspecie, reading } = useCache([
    "estadosPlanta",
    "estagiosEspecie",
  ]);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = plantasService.subscribe((data) => {
      setPlantas(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: plantasService,
    nomeEntidade: "planta",
    masculino: false, // "a planta"
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
          <Button variant="outline-success" onClick={criar}>+ Nova planta</Button>
        </Col>
      </Row>

      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaComAcoes
            dados = {plantas}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Horta", dataKey: "hortaNome",},
              {rotulo: "Estado", dataKey: "estadoId", tagVariantList: cacheEstadosPlanta?.list,},
              {rotulo: "Estágio", dataKey: "estagioId", tagVariantList: cacheEstagiosEspecie?.list,},
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

      <PlantaModal
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