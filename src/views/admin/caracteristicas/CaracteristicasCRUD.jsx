import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { VARIANT_TYPES } from "@shared/types/VARIANT_TYPES";


import ListaAcoes from "../../../components/common/ListaAcoes";
import Loading from "../../../components/common/Loading";
import { NoUser } from "../../../components/common/NoUser";


import { caracteristicasService } from "../../../services/crud/caracteristicasService";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useAuth } from "../../../services/auth/authContext";
import { useToast } from "../../../services/toast/toastProvider";

import { VARIANTS } from "../../../utils/consts/VARIANTS"; //TODO: substituir por types
import { TIPOS_ENTIDADE } from "../../../utils/consts/TIPOS_ENTIDADE"; //TODO: substituir por types

import CaracteristicaModal from "./CaracteristicaModal";

export default function CaracteristicasCRUD() {
  const { toastMessage } = useToast();  
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
  if (loading) return <Loading />
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Button variant="outline-success" onClick={criar}>+ Nova Característica</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <ListaAcoes
            dados = {caracteristicas}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Cor da Tag", dataKey: "tagVariant", tagVariantList: VARIANTS},
              {rotulo: "Aplicável a", dataKey: "aplicavel", tagVariantList: TIPOS_ENTIDADE},
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