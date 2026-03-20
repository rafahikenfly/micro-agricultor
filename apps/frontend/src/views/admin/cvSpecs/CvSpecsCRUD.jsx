import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { VARIANT_TYPES } from "micro-agricultor";

import ListaAcoes from "../common/ListaAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../common/NoUser";

import { cvJobSpecsService } from "../../services/crud/cvJobSpecsService";
import { useCrudUI } from "../../services/ui/crudUI";
import { useAuth } from "../../services/auth/authContext";
import CvSpecModal from "./CvSpecModal";

import { VARIANTE } from "@shared/types/VARIANT_TYPES";

export default function CvJobSpecsCRUD() {
  const { toastMessage } = useToast();  
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [cvSpecs, setCvSpecs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = cvJobSpecsService.subscribe((data) => {
      setCvSpecs(data);
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
          <Button variant="outline-success" onClick={criar}>+ Nova Definição de Tarefa de Visão Computacional</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {loading && <Loading variant="overlay" />}
          <ListaAcoes
            dados = {cvSpecs}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Cor da Tag", dataKey: "tagVariant", tagVariantList: Object.values(VARIANTE), width: "50px"},
              {rotulo: "Apagado",   dataKey: "isDeleted",  boolean: true, width: "50px"},
            ]}
            acoes = {[
              {rotulo: "Editar", funcao: editar, variant: VARIANT_TYPES.YELLOW},
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

      <CvSpecModal
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