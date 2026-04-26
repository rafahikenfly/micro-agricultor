import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { VARIANTE } from "micro-agricultor";

import { estadosPlantaService } from "../../../services/crudService";
import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import EstadoPlantaModal from "./EstadoPlantaModal";
import { renderBadge } from "../../../utils/uiUtils";
import ListaToolbar from "../../../components/listas/ListaToolbar";
import { useMemo } from "react";


export default function EstadosPlantaCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [estados_planta, setEstados_planta] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [filtros, setFiltros] = useState({
    nome: ""
  });
  const estadosFiltrados = useMemo(() => {
    if (!estados_planta?.length) return [];

    return estados_planta.filter((p) => {
      // filtro tipo select
      //ex: if (filtros?.estadoId && p.estadoId !== filtros.estadoId) return false;

      // filtro tipo texto
      //ex: const nome = filtros?.nome?.toLowerCase()
      //ex: if (nome && !p.nome?.toLowerCase().includes(nome)) return false;

      return true;
    });
  }, [estados_planta, filtros]);

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
        configFiltros={[]}
      />
      {loading ? <Loading variant="overlay" /> :
      <ListaComAcoes
        dados = {estadosFiltrados}
        sort
        linhaStyle={(row) => {
          if (row.isDeleted)  { return { textDecoration: "line-through red 3px" }; }
          if (row.isArchived) { return { textDecoration: "line-through dotted 3px" }; }
          return {};
        }}
        colunas = {[
          {rotulo: "Nome", dataKey: "nome", render: (a)=>renderBadge(a,"nome")},
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
      />}

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