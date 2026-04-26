import { useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import { variedadesService } from "../../../services/crudService";
import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import VariedadeModal from "./VariedadeModal";
import { useCache } from "../../../hooks/useCache";
import { VARIANTE } from "micro-agricultor";
import ListaToolbar from "../../../components/listas/ListaToolbar";
import { renderBadge } from "../../../utils/uiUtils";


export default function VariedadesCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />
  const { cacheEspecies, reading } = useCache(["especies"]);
  

  const [variedades, setVariedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [filtros, setFiltros] = useState({
    nome: "",
    especieId: "",
  });
  const variedadesFiltradas = useMemo(() => {
    if (!variedades?.length) return [];

    return variedades.filter((p) => {
      // filtro tipo select
      ex: if (filtros?.especieId && p.especieId !== filtros.especieId) return false;

      // filtro tipo texto
      const nome = filtros?.nome?.toLowerCase()
      if (nome && !p.nome?.toLowerCase().includes(nome)) return false;

      return true;
    });
  }, [variedades, filtros]);

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

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: variedadesService,
    nomeEntidade: "variedade",
    masculino: false, // "a variedade"
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
        dados = {variedadesFiltradas}
        sort
        colunas = {[
          {rotulo: "Nome", dataKey: "nome", render: (a) => a.nome },
          {rotulo: "Espécie", dataKey: "especieId", render: (a) => cacheEspecies?.map.get(a.especieId)?.nome ?? "-" },
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