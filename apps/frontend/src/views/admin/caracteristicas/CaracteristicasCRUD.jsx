import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { VARIANT_TYPES, VARIANTE, ENTIDADE } from "micro-agricultor";


import ListaAcoes from "../../../components/common/ListaAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";


import { caracteristicasService } from "../../../services/crud/caracteristicasService";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useAuth } from "../../../services/auth/authContext";
import { useToast } from "../../../services/toast/toastProvider";

import CaracteristicaModal from "./CaracteristicaModal";

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
          <ListaAcoes
            dados = {caracteristicas}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Cor da Tag", dataKey: "tagVariant", tagVariantList: Object.values(VARIANTE)},
              {rotulo: "Aplicável a", dataKey: "aplicavel", tagVariantList: Object.values(ENTIDADE)},
              {rotulo: "Apagado",   dataKey: "isDeleted",  boolean: true},
            ]}
            acoes = {[
              {rotulo: "Editar", funcao: editar, variant: VARIANT_TYPES.YELLOW},
              {rotulo: "Duplicar", funcao: duplicar, variant: VARIANT_TYPES.LIGHTBLUE},
              {rotulo: "Excluir", funcao: apagarComConfirmacao, variant: VARIANT_TYPES.RED},
              { toggle: "isArchived",
                rotulo: "Desarquivar",
                rotuloFalse: "Arquivar",
                funcao: desarquivar,
                funcaoFalse: arquivar,
                variant: VARIANT_TYPES.GREY,
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