import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

import { plantasService } from "../../../services/crudService";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useAuth } from "../../../services/auth/authContext";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import PlantaModal from "./PlantaModal";
import { useCache } from "../../../hooks/useCache";
import { VARIANTE } from "micro-agricultor";
import { renderBadge } from "../../../utils/uiUtils";
import { useMemo } from "react";
import ListaToolbar from "../../../components/listas/ListaToolbar";


export default function PlantasCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editando, setEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filtros, setFiltros] = useState({
    estadoId: null,
    especieId: null,
    estagioId: null,
    nome: ""
  });
  const plantasFiltradas = useMemo(() => {
    if (!plantas?.length) return [];

    return plantas.filter((p) => {
      // filtro tipo select
      if (filtros?.estadoId && p.estadoId !== filtros.estadoId) return false;
      if (filtros?.especieId && p.especieId !== filtros.especieId) return false;
      if (filtros?.estagioId && p.estagioId !== filtros.estagioId) return false;

      // filtro tipo texto
      const nome = filtros?.nome?.toLowerCase()
      if (nome && !p.nome?.toLowerCase().includes(nome)) return false;

      return true;
    });
  }, [plantas, filtros]);

  const { cacheEstadosPlanta, cacheEstagiosEspecie, cacheEspecies, cacheHortas, reading } = useCache([
    "estadosPlanta",
    "estagiosEspecie",
    "especies",
    "hortas"
  ]);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = plantasService.subscribe((data) => {
      setPlantas(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: plantasService,
    nomeEntidade: "planta",
    masculino: false, // "a planta"
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
          {
            key: "estadoId",
            type: "select",
            label: "Estado",
            list: cacheEstadosPlanta?.list ?? [],
            labelKey: "nome",
            valueKey: "id",
            placeholder: "Todos os estados"
          },
          {
            key: "estagioId",
            type: "select",
            label: "Estágio",
            list: cacheEstagiosEspecie?.list ?? [],
            labelKey: "nome",
            valueKey: "id",
            placeholder: "Todos os estágios"
          },
          {
            key: "especieId",
            type: "select",
            label: "Espécie",
            list: cacheEspecies?.list ?? [],
            labelKey: "nome",
            valueKey: "id",
            placeholder: "Todas espécies"
          },
        ]}
      />
      {loading || reading ? <Loading variant="overlay" /> :
      <ListaComAcoes
        dados = {plantasFiltradas}
        sort
        linhaStyle={(row) => {
          if (row.isDeleted)  { return { textDecoration: "line-through red 3px" }; }
          if (row.isArchived) { return { textDecoration: "line-through dotted 3px" }; }
          return {};
        }}
        colunas = {[
          {rotulo: "Nome", dataKey: "nome", render: (a)=>renderBadge(a, "nome", "estadoId", cacheEstadosPlanta?.map, true, true, "descricao")},
          {rotulo: "Horta", dataKey: "hortaId", render: (a)=>cacheHortas?.map.get(a.hortaId)?.nome},
          {rotulo: "Estágio", dataKey: "estagioId", render: (a)=>renderBadge(a, "estagioNome", "estagioId", cacheEstagiosEspecie?.map, true, false)},
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