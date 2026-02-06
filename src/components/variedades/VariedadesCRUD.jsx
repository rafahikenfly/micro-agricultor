import { useEffect, useState } from "react";
import { variedadesService } from "../../services/crud/variedadesService";
import { catalogosService } from "../../services/catalogosService";
import VariedadeModal from "./VariedadeModal";
import ListaAcoes from "../common/ListaAcoes";
import Loading from "../common/Loading";
import { AppToastConfirmacao, AppToastMensagem } from "../common/toast";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useCrudUI } from "../../services/ui/crudUI";
import { NoUser } from "../common/NoUser";
import { useAuth } from "../../services/auth/authContext";
import { setToast } from "../../services/ui/toast";


export default function VariedadesCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [variedades, setVariedades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [estagios_especie, setEstagios_especie] = useState([]);
  const [reading, setReading] = useState(false);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState({});

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = variedadesService.subscribe((data) => {
      setVariedades(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  useEffect(() => {

    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getEstagios_especie(),
    ]).then(([este, ]) => {
      if (!ativo) return;
      setEstagios_especie(este);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da variedade:", err);
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
    crudService: variedadesService,
    nomeEntidade: "variedade",
    masculino: false, // "a variedade"
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

      <VariedadeModal
        key={editando ? editando.id : `novo`}
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