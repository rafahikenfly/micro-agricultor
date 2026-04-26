import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { canteirosService } from "../../../services/crudService";
import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useCache } from "../../../hooks/useCache";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import CanteiroModal from "./CanteiroModal";
import { VARIANTE } from "micro-agricultor";
import { renderBadge } from "../../../utils/uiUtils";
import ListaToolbar from "../../../components/listas/ListaToolbar";
import { useMemo } from "react";


export default function CanteirosCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [canteiros, setCanteiros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [filtros, setFiltros] = useState({
    estadoId: null,
    nome: ""
  });
  const canteirosFiltrados = useMemo(() => {
    if (!canteiros?.length) return [];

    return canteiros.filter((p) => {
      // filtro tipo select
      if (filtros?.estadoId && p.estadoId !== filtros.estadoId) return false;

      // filtro tipo texto
      const nome = filtros?.nome?.toLowerCase()
      if (nome && !p.nome?.toLowerCase().includes(nome)) return false;

      return true;
    });
  }, [canteiros, filtros]);

    const { cacheEstadosCanteiro, reading } = useCache([
    "estadosCanteiro",
  ]);

  

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = canteirosService.subscribe((data) => {
      setCanteiros(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: canteirosService,
    nomeEntidade: "canteiro",
    masculino: true, // "o canteiro"
    user,
    editando,
    registroParaExcluir,
    setEditando,
    setShowModal,
    setRegistroParaExcluir,
  });
  /* ================= RENDER ================= */
  if (reading) return <Loading variant="overlay" />
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
          {
            key: "estadoId",
            type: "select",
            label: "Estado",
            list: cacheEstadosCanteiro?.list ?? [],
            labelKey: "nome",
            valueKey: "id",
            placeholder: "Todos os estados"
          },
        ]}
      />
      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaComAcoes
            dados = {canteirosFiltrados}
            sort
            colunas = {[
              {rotulo: "Nome", dataKey: "nome", render: (a)=>renderBadge(a,"nome", "estadoId", cacheEstadosCanteiro.map ?? {}, true)},
              {rotulo: "Horta", dataKey: "hortaNome",},
            ]}
            acoes = {[
              {rotulo: "📝", funcao: editar, variant:VARIANTE.YELLOW.variant.id},
              {rotulo: "⧉", funcao: duplicar, variant: VARIANTE.GREY.variant.id},
              {rotulo: "🗑️", funcao: apagarComConfirmacao, variant: VARIANTE.RED.variant.id},
              { toggle: "isArchived",
                rotulo: "💤",
                rotuloFalse: "⚡",
                funcao: desarquivar,
                funcaoFalse: arquivar,
                variant: VARIANTE.GREY.variant.id,
              },
            ]}
          />
        </Col>
      </Row>

      <CanteiroModal
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