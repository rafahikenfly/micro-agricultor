import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { VARIANT_TYPES } from "@shared/types/VARIANT_TYPES";

import { plantasService } from "../../../services/crud/plantasService";
import { catalogosService } from "../../../services/catalogosService";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useAuth } from "../../../services/auth/authContext";
import { useToast } from "../../../services/toast/toastProvider";

import ListaAcoes from "../../../components/common/ListaAcoes";
import Loading from "../../../components/common/Loading";
import { NoUser } from "../../../components/common/NoUser";

import PlantaModal from "./PlantaModal";


export default function PlantasCRUD() {
  const { toastMessage } = useToast();  
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [estados_planta, setEstados_planta] = useState([]);
  const [estagios_especie, setEstagios_especie] = useState([]);
  const [reading, setReading] = useState(false);

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

  useEffect(() => {

    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getEstados_planta(),
      catalogosService.getEstagios_especie(),
    ]).then(([estp, este]) => {
      if (!ativo) return;
      setEstados_planta(estp);
      setEstagios_especie(este)
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da planta:", err);
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
  if (loading || reading) return <Loading />
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Button variant="outline-success" onClick={criar}>+ Nova planta</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <ListaAcoes
            dados = {plantas}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Horta", dataKey: "hortaNome",},
              {rotulo: "Estado", dataKey: "estadoId", tagVariantList: estados_planta,},
              {rotulo: "Estágio", dataKey: "estagioId", tagVariantList: estagios_especie,},
              {rotulo: "Apagado", dataKey: "isDeleted", boolean: true},
            ]}
            acoes = {[
              {rotulo: "Editar", funcao: editar, variant: "warning"},
              {rotulo: "Excluir", funcao: apagarComConfirmacao, variant: "danger"},
              { toggle: "isArchived",
                rotulo: "Desarquivar",
                funcao: desarquivar,
                variant: "secondary",
                rotuloFalse: "Arquivar",
                funcaoFalse: arquivar,
                variantFalse: "dark"
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