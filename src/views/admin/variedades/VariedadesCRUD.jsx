import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { VARIANT_TYPES } from "@shared/types/VARIANT_TYPES";

import { variedadesService } from "../../../services/crud/variedadesService";
import { useToast } from "../../../services/toast/toastProvider";
import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";

import ListaAcoes from "../../../components/common/ListaAcoes";
import Loading from "../../../components/common/Loading";
import { NoUser } from "../../../components/common/NoUser";

import VariedadeModal from "./VariedadeModal";


export default function VariedadesCRUD() {
  const { toastMessage } = useToast();  
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [variedades, setVariedades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reading, setReading] = useState(false);

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
  // Catalogos
  useEffect(() => {

    let ativo = true;
    setReading(true);
  
    Promise.all([
//      catalogosService.getEstagios_especie(),
    ]).then(([este, ]) => {
      if (!ativo) return;
//      setEstagios_especie(este);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da variedade:", err);
      toastMessage({
        body: "Erro ao carregar catálogos.",
        variant: VARIANT_TYPES.RED
      });
    })
    .finally(() => {
      if (ativo) setReading(false);
    });
  
    return () => { ativo = false };
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
  if (loading || reading) return <Loading />
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Button variant="outline-success" onClick={criar}>+ Nova variedade</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <ListaAcoes
            dados = {variedades}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Espécie", dataKey: "especieNome", },
              {rotulo: "Apagado", dataKey: "isDeleted",  boolean: true, },
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