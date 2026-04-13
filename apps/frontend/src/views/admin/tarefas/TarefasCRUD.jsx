import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import { tarefasService } from "../../../services/crud/tarefasService";
import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useToast } from "../../../services/toast/toastProvider";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import TarefaModal from "./TarefaModal";


export default function TarefasCRUD() {
  const { toastMessage } = useToast();  
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
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Apagado", dataKey: "isDeleted",  boolean: true, },
              {rotulo: "Estado", dataKey: "estado", },
              {rotulo: "Vencimento", dataKey: "vencimento", },
              {rotulo: "Recorrência", dataKey: "recorrencia", },
            ]}
            acoes = {[
              {rotulo: "Editar", funcao: editar, variant: "warning"},
              {rotulo: "Excluir", funcao: apagarComConfirmacao, variant: "danger"},
              { toggle: "isArchived",
                rotulo: "Desarquivar",
                rotuloFalse: "Arquivar",
                funcao: desarquivar,
                funcaoFalse: arquivar,
                variant: "secondary",
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