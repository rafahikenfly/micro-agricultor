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


export default function TarefasCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

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
    registroParaExcluir,
    setEditando,
    setShowModal,
    setRegistroParaExcluir,
  });

  /* ================= RENDER ================= */
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Button variant="outline-success" onClick={criar}>+ Nova tarefa</Button>
        </Col>
      </Row>

      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaComAcoes
            dados = {tarefas}
            sort
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Estado", dataKey: "estado", render: (a) => ESTADO_TAREFA[a.estado]?.nome ?? "-"},
              {rotulo: "Vencimento", dataKey: "planejamento", render: (a) => ISOToReadableString(a.planejamento.venceEm)},
              {rotulo: "Recorrência", dataKey: "recorrencia", render: (a) => RECORRENCIA[a.planejamento.recorrencia?.tipoRecorrenciaId]?.nome ?? "-"},
              {rotulo: "Execuções", dataKey: "execucoes", render: (a) => a.planejamento.recorrencia?.execucoes ?? 0},
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