import { useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { VARIANTE } from "micro-agricultor";


import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";


import { useCrudUI } from "../../../services/ui/crudUI";
import { useAuth } from "../../../services/auth/authContext";

import MidiaModal from "./MidiaModal";
import { midiasService } from "../../../services/crudService";
import ListaToolbar from "../../../components/listas/ListaToolbar";

export default function MidiasCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [midias, setMidias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [filtros, setFiltros] = useState({
    nome: "",
  });
  const midiasFiltradas = useMemo(() => {
    if (!midias?.length) return [];

    return midias.filter((p) => {
      // filtro tipo select
      //if (filtros?.especieId && p.especieId !== filtros.especieId) return false;

      // filtro tipo texto
      const nome = filtros?.nome?.toLowerCase()
      if (nome && !p.nome?.toLowerCase().includes(nome)) return false;

      return true;
    });
  }, [midias, filtros]);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = midiasService.subscribe((data) => {
      setMidias(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: midiasService,
    nomeEntidade: "midia",
    masculino: false, // "a mídia"
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
      
      {loading && <Loading variant="overlay" />}
      <ListaComAcoes
        dados = {midiasFiltradas}
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
      />

      <MidiaModal
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