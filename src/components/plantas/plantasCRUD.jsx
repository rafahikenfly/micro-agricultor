import { useEffect, useState } from "react";
import { plantasService } from "../../services/crud/plantasService";
import { catalogosService } from "../../services/catalogosService";
import PlantaModal from "./PlantaModal";
import ListaAcoes from "../common/ListaAcoes";
import Loading from "../common/Loading";
import { AppToastConfirmacao, AppToastMensagem } from "../common/toast";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useCrudUI } from "../../services/ui/crudUI";
import { NoUser } from "../common/NoUser";
import { useAuth } from "../../services/auth/authContext";
import { setToast } from "../../services/ui/toast";


export default function PlantasCRUD() {
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
  const [showToast, setShowToast] = useState({});

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
      showToast("Erro ao carregar catálogos.", "danger");
    })
    .finally(() => {
      if (ativo) setReading(false);
    });
  
    return () => { ativo = false };
  }, []);

  /* ================= CRUD ================= */
  const {
    criar,
    editar,
    atualizar,
    arquivar,
    desarquivar,
    apagarComConfirmacao,
  } = useCrudUI({
    crudService: plantasService,
    nomeEntidade: "planta",
    masculino: false, // "a planta"
    user,
  
    editando,
    registroParaExcluir,
    
    setEditando,
    setShowModal,
    setRegistroParaExcluir,
    setShowToast,
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
        key={editando?.id}
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditando(null);
        }}
        onSave={atualizar}
        data={editando}
        setToast={(toast) => setToast(toast, setShowToast)}
      />
      {/* ======= TOAST MENSAGEM E CONFIRMACAO ========= */}
      <AppToastMensagem
        show={showToast.show && !showToast.confirmacao}
        onClose={() => setShowToast(prev => ({ ...prev, show: false }))}
        body={showToast.body}
        variant={showToast.variant}
      />
      <AppToastConfirmacao
        show={showToast.show && showToast.confirmacao}
        onCancel={showToast.onCancel}
        onConfirm={showToast.onConfirm}
        body={showToast.body}
        variant={showToast.variant}
      />

    </Container>
  );
}