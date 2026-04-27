import { Container } from "react-bootstrap"
import ListaToolbar from "../../../components/listas/ListaToolbar";
import Loading from "../../../components/Loading";
import ListaComAcoes from "../../../components/common/ListaComAcoes";
import { relatoriosService } from "../../../services/crudService";
import { useState } from "react";
import { useMemo } from "react";
import { useEffect } from "react";
import { renderBadge } from "../../../utils/uiUtils";
import { VARIANTE } from "micro-agricultor";

export default function EvolucaoCaracteristica ({}) {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    nome: ""
  });
  const relatoriosFiltrados = useMemo(() => {
    if (!relatorios?.length) return [];
    
        return relatorios.filter((p) => {
          // filtro tipo select
          //ex: if (filtros?.estadoId && p.estadoId !== filtros.estadoId) return false;
    
          // filtro tipo texto
          //ex: const nome = filtros?.nome?.toLowerCase()
          //ex: if (nome && !p.nome?.toLowerCase().includes(nome)) return false;
    
          return true;
        });
      }, [relatorios, filtros]);
      /* ================= CARREGAR DADOS ================= */
      useEffect(() => {
        setLoading(true);
    
        const unsub = relatoriosService.subscribe((data) => {
          setRelatorios(data);
          setLoading(false); // só desliga quando os dados chegam
        });
    
        return unsub;
      }, []);
  return (
    <Container fluid>
      <ListaToolbar
        filtros={filtros}
        setFiltros={setFiltros}
        configFiltros={[]}
      />

      {loading ? <Loading variant="overlay" /> :
      <ListaComAcoes
        dados = {relatoriosFiltrados}
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
          {rotulo: "Abrir", funcao: ()=>{console.log("TODO")}, variant:VARIANTE.YELLOW.variant},
        ]}
      />}

    </Container>
  );
}