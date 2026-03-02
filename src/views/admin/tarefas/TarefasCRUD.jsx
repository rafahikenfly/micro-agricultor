import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import { tarefasService } from "../../../services/crud/tarefasService";
import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useToast } from "../../../services/toast/toastProvider";

import ListaAcoes from "../../../components/common/ListaAcoes";
import Loading from "../../../components/common/Loading";
import { NoUser } from "../../../components/common/NoUser";

import TarefaModal from "./TarefaModal";


export default function TarefasCRUD() {
  const { toastMessage } = useToast();  
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reading, setReading] = useState(false);

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

  useEffect(() => {

    let ativo = true;
    setReading(true);
  
    Promise.all([
//      catalogosService.getEstagios_especie(),
    ]).then(([este, ]) => {
      if (!ativo) return;
//      setEstagios_especie(este);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da tarefa:", err);
      toastMessage({
        body: "Erro ao carregar catálogos.",
        variant: VARIANT_TYPES.RED
      });
    })
    .finally(() => {
      if (ativo) setReading(false);
    });
  
    return () => { ativo = false };
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
  if (loading || reading) return <Loading />
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Button variant="outline-success" onClick={criar}>+ Nova tarefa</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <ListaAcoes
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
                funcao: desarquivar,
                variant: "secondary",
                rotuloFalse: "Arquivar",
                funcaoFalse: arquivar,
                variantFalse: "dark"
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