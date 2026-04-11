import React, { useState, useMemo } from "react";
import {
    Button,
    Table,
    Badge,
    Card
  } from "react-bootstrap";
  
function ListaComAcoes ({colunas, sort, dados, acoes,}) {
  /**
   * Renderiza uma lista a partir de um array de dados, com campos configuráveis e ações.
   * - Um campo marcado como boolean renderiza um badge conforme o valor sim/não.
   * - Um campo marcado como contar renderiza a contagem de uma coleção no campo de valor.
   * - Um campo com tagVariantList renderiza um badge com a cor definida na prop tagVariant.
   * - Um campo marcado como toogle (passando uma propriedade condicionante), renderiza um botão condicionado.
   * @param colunas array de objetos do tipo: {
   *  rotulo: String,     rótulo da coluna
   *  dataKey: String,    nome da chave de cada objeto do array que compõe a coluna
   *  render?: function,  Função opcional, que recebe o dado como argumento, com o que deve ser renderizado.
   *  boolean?: Boolean,    //TODO: Padronizar no render
   *  toggle: string,       //TODO: Padronizar no render
   *  tagVariantList: array //TODO: Padronizar no render
   * }
   * @param sort Boolean usar ou não o sort da lista
   * @param dados array com os dados a serem representados na lista
   * @param acoes array de objetos do tipo: {rotulo: String, funcao: function, variant?: String, toggle?: String, rotuloFalse?: String, funcaoFalse: function, variantFalse: String }
   */
  const [ordem, setOrdem] = useState({
    orderKey: null,      // ex: "nome"
    direcao: "asc"    // "asc" | "desc"
  });

  const dadosOrdenados = useMemo(() => {
    if (!ordem.orderKey) return dados;

    return [...dados].sort((a, b) => {
      const v1 = a[ordem.orderKey];
      const v2 = b[ordem.orderKey];

      if (v1 == null) return 1;
      if (v2 == null) return -1;

      if (typeof v1 === "string") {
        return ordem.direcao === "asc"
          ? v1.localeCompare(v2)
          : v2.localeCompare(v1);
      }

      return ordem.direcao === "asc"
        ? v1 - v2
        : v2 - v1;
    });
  }, [dados, ordem]);


  if (!Array.isArray(colunas)) {
    console.error("ListaComacoes: colunas não é um array", colunas);
    return null;
  }
  if (!Array.isArray(dados)) {
    console.error("ListaComacoes: dados não é um array", dados);
    return null;
  }
  if (!Array.isArray(acoes)) {
    console.error("ListaComacoes: acoes não é um array", acoes);
    return null;
  }

  const handleOrdenar = (orderKey) => {
    setOrdem((prev) => {
      if (prev.orderKey === orderKey) {
        return {
          orderKey,
          direcao: prev.direcao === "asc" ? "desc" : "asc"
        };
      }
      return { orderKey, direcao: "asc" };
    });
  };

      /* RENDER */
      return (
        <Card>
        <Card.Body>
          <Table bordered hover responsive>
            <thead>
              <tr>
                {colunas.map(col => (
                  <th key={col.dataKey} style={{ width: col.width }} onClick={() => sort ? handleOrdenar(col.dataKey) : null}
                  >
                    {col.rotulo || "-"}
                    {ordem.orderKey === col.dataKey && (
                      <span className="ms-1">
                        {ordem.direcao === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {dadosOrdenados.map((dado, dado_idx) => (
                <React.Fragment key={dado.id ?? `dado-${dado_idx}`}>
                  <tr>
                    {colunas.map((col, col_idx) => {
                      if (col.boolean) return (
                        <td key = {`${col.dataKey}-${col_idx}`}>
                          <Badge bg={dado[col.dataKey] ? "info" : "danger"}>{dado[col.dataKey] ? "Sim" : "Não"}</Badge>
                        </td>
                      )
                      if (col.contar) return (
                        <td key = {`${col.dataKey}-${col_idx}`}>{Object.values(dado[col.dataKey]).length}</td> //TODO e se for um array?
                      )
                      if (col?.tagVariantList?.length > 0) {
                        const rawValue = dado[col.dataKey];
                        let badges = [];
                        if (typeof rawValue === "object") {
                          // {id1:true, id2: true...} ==> [id1, id2...]}
                          badges = Object.keys(rawValue).filter(key => rawValue[key] === true);
                        }
                        else if (typeof rawValue === "string") {
                          badges = [rawValue];
                        }                         return (
                          <td key={`${col.dataKey}-${col_idx}`}>
                            {badges.map((item, idx) => {
                              const badge = col.tagVariantList.find(tv => tv.id === item);
                              return (
                                <Badge key={`${col.dataKey}-${col_idx}-${idx}`} bg={badge?.tagVariant || "dark"} className="me-1">
                                  {badge?.nome || item}
                                </Badge>
                              );
                            })}
                          </td>
                        )
                      }
                      if(col.render) return (
                        <td key = {`${col.dataKey}-${col_idx}`}>
                          {col.render(dado[col.dataKey])}
                        </td>
                      )
                      return(
                        <td key = {col_idx}>{dado[col.dataKey]}</td>
                      )
                      })}
                    <td>
                    {acoes.map((acao, i) => {
                      if (acao.toggle) return (
                        <Button
                        key = {dado[acao.toggle] ? acao.rotulo : acao.rotuloFalse}
                        size="sm"
                        variant= {dado[acao.toggle] ? `${acao?.variant}` : `outline-${acao?.variant}`}
                        className="me-1"
                        onClick={dado[acao.toggle] ? () => acao.funcao(dado, dado_idx) : () => acao.funcaoFalse(dado, dado_idx)}
                      >
                        {dado[acao.toggle] ? acao.rotulo : acao.rotuloFalse}
                      </Button>
                      )
                      return (
                      <Button
                        key = {i}
                        size="sm"
                        variant= {`outline-${acao?.variant}` || "primary"}
                        className="me-1"
                        onClick={() => acao.funcao(dado, dado_idx)}
                      >
                        {acao.rotulo}
                      </Button>
                    )
                    })}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    )
  }

  export default ListaComAcoes;