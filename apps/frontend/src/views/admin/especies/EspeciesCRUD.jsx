import { useEffect, useMemo, useState } from "react";
import { Container } from "react-bootstrap";

import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useCache } from "../../../hooks/useCache";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import EspecieModal from "./EspecieModal";
import { especiesService } from "../../../services/crudService";
import { VARIANTE } from "micro-agricultor";
import { renderBadge } from "../../../utils/uiUtils";
import ListaToolbar from "../../../components/listas/ListaToolbar";

export default function EspeciesCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />
  const { cacheCategoriasEspecie, reading } = useCache([
    "categoriasEspecie",
  ]);

  const [especies, setEspecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [filtros, setFiltros] = useState({
    nome: ""
  });
  const especiesFiltradas = useMemo(() => {
    if (!especies?.length) return [];

    return especies.filter((p) => {
      // filtro tipo select
      //ex: if (filtros?.estadoId && p.estadoId !== filtros.estadoId) return false;

      // filtro tipo texto
      const nome = filtros?.nome?.toLowerCase()
      if (nome && !p.nome?.toLowerCase().includes(nome)) return false;

      return true;
    });
  }, [especies, filtros]);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = especiesService.subscribe((data) => {
      setEspecies(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: especiesService,
    nomeEntidade: "espécie",
    masculino: false, // "a espécie"
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
        dados = {especiesFiltradas}
        sort
        colunas = {[
          {rotulo: "Nome", dataKey: "nome", render: (a)=>renderBadge(a,"nome", "categoriaId", cacheCategoriasEspecie.map ?? {})},
          {rotulo: "Estágios", dataKey: "ciclo", render: (a)=>a.ciclo.length, width: "50px"},
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

      <EspecieModal
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