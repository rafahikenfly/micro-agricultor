import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Button,
    Table,
    Badge,
    Modal,
    Form,
    Collapse,
    Toast,
    ToastContainer,
    Card
  } from "react-bootstrap";
  
  function ListaAcoes ({campos, dados, acoes,}) {
  /**
   * Renderiza uma lista a partir de um array de dados, com campos configuráveis e ações.
   * - Um campo marcado como boolean renderiza um badge conforme o valor sim/não.
   * - Um campo marcado como contar renderiza a contagem de uma coleção no campo de valor.
   * - Uma acao marcada como toogle (passando uma propriedade condicionante), renderiza um botão condicionado.
   * @param campos array de objetos do tipo: {rotulo: String, data: String, boolean?: Boolean}
   * @param dados array com os dados a serem representados na lista
   * @param acoes array de objetos do tipo: {rotulo: String, funcao: function, variant?: String, toggle?: String, rotuloFalse?: String, funcaoFalse: function, variantFalse: String }
   */
  if (!Array.isArray(campos)) {
        console.error("ListaCRUD: campos não é um array", campos);
        return null;
    }
    if (!Array.isArray(dados)) {
        console.error("ListaCRUD: dados não é um array", dados);
        return null;
    }
    if (!Array.isArray(acoes)) {
        console.error("ListaCRUD: acoes não é um array", acoes);
        return null;
    }

      /* RENDER */
      return (
        <Card>
        <Card.Body>
          <Table bordered hover responsive>
            <thead>
              <tr>
                {campos.map(campo => (
                    <th key = {campo.data}>{campo.rotulo}</th>
                ))}
                <th width="240">Ações</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((data, idx) => (
                <React.Fragment key={data.id}>
                  <tr>
                    {campos.map((campo, i) => {
                      if (campo.boolean) return (
                        <td key = {i}>
                          <Badge bg={data[campo.data] ? "info" : "danger"}>{data[campo.data] ? "Sim" : "Não"}</Badge>
                        </td>
                      )
                      if (campo.contar) return (
                        <td key = {i}>{Object.values(data[campo.data]).length}</td> //TODO e se for um array?
                      )
                      return(
                        <td key = {i}>{data[campo.data]}</td>
                      )
                      })}
                    <td>
                    {acoes.map((acao, i) => {
                      if (acao.toggle) return (
                        <Button
                        key = {data[acao.toggle] ? acao.rotulo : acao.rotuloFalse}
                        size="sm"
                        variant= {data[acao.toggle] ? acao?.variant || "primary" : acao?.variantFalse || "primary"}
                        className="me-1"
                        onClick={data[acao.toggle] ? () => acao.funcao(data, idx) : () => acao.funcaoFalse(data, idx)}
                      >
                        {data[acao.toggle] ? acao.rotulo : acao.rotuloFalse}
                      </Button>
                      )
                      return (
                      <Button
                        key = {i}
                        size="sm"
                        variant= {acao?.variant || "primary"}
                        className="me-1"
                        onClick={() => acao.funcao(data, idx)}
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

  export default ListaAcoes;