import React, { useState, useMemo } from "react";
import {
    Button,
    Table,
    Badge,
    Card
  } from "react-bootstrap";
  
function ListaComAcoes ({linhaStyle, colunas, sort, dados, acoes,}) {
  /**
   * Renderiza uma lista a partir de um array de dados, com campos configuráveis e ações.
   * - Um campo marcado como toogle (passando uma propriedade condicionante), renderiza um botão condicionado.
   * @param colunas array de objetos do tipo: {
   *  rotulo: String,     rótulo da coluna
   *  dataKey: String,    nome da chave de cada objeto do array que compõe a coluna
   *  render?: function,  Função opcional, que recebe o dado como argumento, com o que deve ser renderizado.
   *  boolean?: Boolean,    //TODO: Padronizar no render
   *  toggle: string,       //TODO: Padronizar no render
   *  variantList: array //TODO: Padronizar no render
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
    console.error("ListaComAcoes: colunas não é um array", colunas);
    return null;
  }
  if (!Array.isArray(dados)) {
    console.error("ListaComAcoes: dados não é um array", dados);
    return null;
  }
  if (!Array.isArray(acoes)) {
    console.error("ListaComAcoes: acoes não é um array", acoes);
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
                  <th
                    key={`header-${col.dataKey}`}
                    style={{ width: col.width }}
                    onClick={() => sort ? handleOrdenar(col.dataKey) : null}
                  >
                    {col.rotulo || "-"}
                    {ordem.orderKey === col.dataKey && (
                      <span className="ms-1">
                        {ordem.direcao === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
                <th
                  key="header-acoes"
                  style={{width: acoes.length * 40}}
                >
                  {/* açoes */}
                </th>
              </tr>
            </thead>
            <tbody>
              {dadosOrdenados.map((row, row_idx) => (
                <React.Fragment key={row.id ?? `dado-${row_idx}`}>
                  <tr style={linhaStyle ? linhaStyle(row, row_idx) : {}}>
                    {colunas.map((col, col_idx) => {
                      // propriedade RENDER tem prioridade (uso indica o que renderizar)
                      // se não tem nada, vai renderizar o dado de datakey
                      if(col.render) return (
                        <td
                          key = {`${col.dataKey}-${col_idx}`}
                          style={col.tdStyle ? col.tdStyle(row, row_idx) : {}}
                        >
                          {col.render(row, row_idx)}
                        </td>
                      )
                      return(
                        <td
                          key = {col_idx}
                          style={col.tdStyle ? col.tdStyle(row, row_idx) : {}}
                        >
                          {row[col.dataKey]}
                        </td>
                      )
                      })}
                    <td>
                    {acoes.map((acao, i) => {
                      if (acao.toggle) return (
                        <Button
                        key = {row[acao.toggle] ? acao.rotulo : acao.rotuloFalse}
                        size="sm"
                        variant= {row[acao.toggle] ? `${acao?.variant}` : `outline-${acao?.variant}`}
                        className="me-1"
                        onClick={row[acao.toggle] ? () => acao.funcao(row, row_idx) : () => acao.funcaoFalse(row, row_idx)}
                      >
                        {row[acao.toggle] ? acao.rotulo : acao.rotuloFalse}
                      </Button>
                      )
                      return (
                      <Button
                        key = {i}
                        size="sm"
                        variant= {`outline-${acao?.variant}` || "primary"}
                        className="me-1"
                        onClick={() => acao.funcao(row, row_idx)}
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