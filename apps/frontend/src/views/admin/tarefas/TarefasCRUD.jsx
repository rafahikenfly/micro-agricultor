import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import TarefaModal from "./TarefaModal";
import { tarefasService } from "../../../services/crudService";
import { ESTADO_TAREFA, RECORRENCIA, VARIANTE } from "micro-agricultor";
import { ISOToReadableString } from "../../../utils/dateUtils";
import { useMemo } from "react";
import ListaToolbar from "../../../components/listas/ListaToolbar";


export default function TarefasCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [filtros, setFiltros] = useState({
    nome: "",
  });
  const tarefasFiltradas = useMemo(() => {
    if (!tarefas?.length) return [];

    return tarefas.filter((p) => {
      // filtro tipo select
      //if (filtros?.especieId && p.especieId !== filtros.especieId) return false;

      // filtro tipo texto
      const nome = filtros?.nome?.toLowerCase()
      if (nome && !p.nome?.toLowerCase().includes(nome)) return false;

      return true;
    });
  }, [tarefas, filtros]);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = tarefasService.subscribe((data) => {
      setTarefas(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  /* ================= CRUD ================= */
  const { criar, editar, duplicar, atualizar, arquivar, desarquivar, apagarComConfirmacao, } = useCrudUI({
    crudService: tarefasService,
    nomeEntidade: "tarefa",
    masculino: false, // "a tarefa"
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
        dados = {tarefasFiltradas}
        sort
        colunas = {[
          {rotulo: "Nome", dataKey: "nome",},
          {rotulo: "Estado", dataKey: "estado", render: (a) => ESTADO_TAREFA[a.estado]?.nome ?? "-"},
          {rotulo: "Vencimento", dataKey: "planejamento", render: (a) => ISOToReadableString(a.planejamento.venceEm)},
          {rotulo: "Recorrência", dataKey: "recorrencia", render: (a) => RECORRENCIA[a.planejamento.recorrencia?.tipoRecorrenciaId]?.nome ?? "-"},
          {rotulo: "Execuções", dataKey: "execucoes", render: (a) => a.planejamento.recorrencia?.execucoes ?? 0},
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

      <TarefaModal
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