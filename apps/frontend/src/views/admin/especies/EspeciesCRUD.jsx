import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../../services/auth/authContext";
import { useCrudUI } from "../../../services/ui/crudUI";
import { useCache } from "../../../hooks/useCache";

import ListaComAcoes from "../../../components/common/ListaComAcoes";
import Loading from "../../../components/Loading";
import { NoUser } from "../../../components/common/NoUser";

import EspecieModal from "./EspecieModal";
import { especiesService } from "../../../services/crudService";

export default function EspeciesCRUD() {
  const { user } = useAuth();
  if (!user) return <NoUser />
  const { cacheCategoriasEspecie, reading } = useCache([
    "categoriasEspecie",
  ]);

  const [especies, setEspecies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

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
          <Button variant="outline-success" onClick={criar}>+ Nova espécie</Button>
        </Col>
      </Row>

      <Row>
        <Col style={{ position: "relative" }}>
          {loading && <Loading variant="overlay" />}
          <ListaComAcoes
            dados = {especies}
            colunas = {[
              {rotulo: "Nome", dataKey: "nome", },
              {rotulo: "Categoria", dataKey: "categoriaId", tagVariantList: reading ? {} : cacheCategoriasEspecie?.list, width: "100px"},
              {rotulo: "Estágios", dataKey: "ciclo", render: (a)=>a.ciclo.length, width: "50px"},
            ]}
            acoes = {[
              {rotulo: "Editar", funcao: editar, variant: "warning"},
              {rotulo: "Duplicar", funcao: duplicar, variant: "outline-success"},
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