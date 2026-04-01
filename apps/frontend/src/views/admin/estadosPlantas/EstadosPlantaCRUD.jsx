import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { VARIANTE } from "micro-agricultor";

import { estadosPlantaService } from "../../../services/crud/estadosPlantaService";
import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useToast } from "../../../services/toast/toastProvider";

import ListaAcoes from "../../../components/common/ListaAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import EstadoPlantaModal from "./EstadoPlantaModal";


export default function EstadosPlantaCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [estados_planta, setEstados_planta] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = estadosPlantaService.subscribe((data) => {
      setEstados_planta(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: estadosPlantaService,
    nomeEntidade: "estado de planta",
    masculino: true, // "o estado de planta"
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
          <Button variant="outline-success" onClick={criar}>+ Novo Estado de Planta</Button>
        </Col>
      </Row>

      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaAcoes
            dados = {estados_planta}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Cor da Tag", dataKey: "tagVariant", tagVariantList: Object.values(VARIANTE)},
              {rotulo: "Apagado",   dataKey: "isDeleted",  boolean: true},
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

      <EstadoPlantaModal
        key={editando ? editando.id : `novo`}
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