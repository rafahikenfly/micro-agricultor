import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { VARIANT_TYPES } from "micro-agricultor";

import { canteirosService } from "../../../services/crud/canteirosService";
import { catalogosService } from "../../../services/catalogosService";
import { useAuth } from "../../../services/auth/authContext";
import { useToast } from "../../../services/toast/toastProvider";
import { useCrudUI } from "../../../services/ui/crudUI";

import ListaAcoes from "../../../components/common/ListaAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import CanteiroModal from "./CanteiroModal";


export default function CanteirosCRUD() {
  const { toastMessage } = useToast();  
  const { user } = useAuth();
  if (!user) return <NoUser />

  const [canteiros, setCanteiros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [estados_canteiro, setEstados_canteiro] = useState([]);
  const [reading, setReading] = useState(false);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    setLoading(true);

    const unsub = canteirosService.subscribe((data) => {
      setCanteiros(data);
      setLoading(false); // só desliga quando os dados chegam
    });

    return unsub;
  }, []);

  useEffect(() => {

    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getEstados_canteiro(),
    ]).then(([estc, ]) => {
      if (!ativo) return;
      setEstados_canteiro(estc);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos do canteiro:", err);
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
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Button variant="outline-success" onClick={criar}>+ Novo canteiro</Button>
        </Col>
      </Row>

      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaAcoes
            dados = {canteiros}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome",},
              {rotulo: "Horta", dataKey: "hortaNome",},
              {rotulo: "Estado", dataKey: "estadoId", tagVariantList: reading ? {} : estados_canteiro,},
              {rotulo: "Apagado", dataKey: "isDeleted",  boolean: true},
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