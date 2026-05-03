import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { modelosCVService } from "../../../services/crudService";
import CvModeloModal from "./CvModeloModal";
import { useAuth } from "../../../services/auth/authContext";
import { NoUser } from "../../../components/common/NoUser";
import Loading from "../../../components/Loading";
import ListaComAcoes from "../../../components/common/ListaComAcoes";
import { useCrudUI } from "../../../services/ui/crudUI";
import { VARIANTE } from "micro-agricultor";
import { useMemo } from "react";
import ListaToolbar from "../../../components/listas/ListaToolbar";


export default function ModelosCVCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [modelosCv, setModelosCv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [filtros, setFiltros] = useState({
    nome: "",
  });
  const modelosFiltrados = useMemo(() => {
    if (!modelosCv?.length) return [];

    return modelosCv.filter((p) => {
      // filtro tipo select
      //ex: if (filtros?.especieId && p.especieId !== filtros.especieId) return false;

      // filtro tipo texto
      const nome = filtros?.nome?.toLowerCase()
      if (nome && !p.nome?.toLowerCase().includes(nome)) return false;

      return true;
    });
  }, [modelosCv, filtros]);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = modelosCVService.subscribe((data) => {
      setModelosCv(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: modelosCVService,
    nomeEntidade: "modelo de CV",
    masculino: true, // "o modelo"
    user,
    editando,
    setEditando,
    setShowModal,
  });
  /* ================= RENDER ================= */
  return (
    <Container fluid>
      <ListaToolbar
        onNovo={criar}
        filtros={filtros}
        setFiltros={setFiltros}
        configFiltros={[
          {
            key: "nome",
            type: "text",
            label: "Nome",
            placeholder: "Nome"
          },
        ]}
      />

      {loading ? <Loading variant="overlay" /> :
      <ListaComAcoes
        dados = {modelosFiltrados}
        sort
        colunas = {[
          {rotulo: "Nome", dataKey: "nome",},
        ]}
        acoes = {[
          {rotulo: "📝", funcao: editar, variant:VARIANTE.YELLOW.variant},
          {rotulo: "⧉", funcao: duplicar, variant: VARIANTE.GREY.variant},
          {rotulo: "🗑️", funcao: apagarComConfirmacao, variant: VARIANTE.RED.variant},
          { toggle: "isArchived",
            rotulo: "💤",
            rotuloFalse: "⚡",
            funcao: desarquivar,
            funcaoFalse: arquivar,
            variant: VARIANTE.GREY.variant,
          },
        ]}
      />}
      <CvModeloModal
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