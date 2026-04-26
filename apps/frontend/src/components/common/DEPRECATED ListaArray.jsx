import React from "react";
import { Table, Button, Card } from "react-bootstrap";

function ListaArray({
  colunas,
  dados,
  onAdd,
  onRemove,
  addLabel = "+ Adicionar",
  showIndex = true,
}) {

  /* ====== GUARDS ====== */
  if (!Array.isArray(colunas)) {
    console.error("ListaArray: colunas não é um array", colunas);
    return null;
  }

  if (!Array.isArray(dados)) {
    console.error("ListaArray: dados não é um array", dados);
    return null;
  }

  /* ====== RENDER ====== */
  return (
    <Card>
      <Card.Body>

        {onAdd && (
          <Button
            size="sm"
            className="mb-2"
            onClick={onAdd}
          >
            {addLabel}
          </Button>
        )}

        <Table size="sm" bordered hover responsive>
          <thead>
            <tr>
              {showIndex && <th>#</th>}

              {colunas.map((col, idx) => (
                <th key={idx} style={{ width: col.width }}>
                  {col.rotulo}
                </th>
              ))}

              {onRemove && <th width="80"></th>}
            </tr>
          </thead>

          <tbody>
            {dados.length === 0 && (
              <tr>
                <td
                  colSpan={
                    colunas.length +
                    (showIndex ? 1 : 0) +
                    (onRemove ? 1 : 0)
                  }
                  className="text-center text-muted"
                >
                  Nenhum item
                </td>
              </tr>
            )}

            {dados.map((item, idx) => (
              <tr key={idx}>
                {showIndex && <td>{idx}</td>}

                {colunas.map((col, colIdx) => (
                  <td key={colIdx}>
                    {col.render
                      ? col.render(item, idx)
                      : item[col.dataKey]}
                  </td>
                ))}

                {onRemove && (
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => onRemove(idx)}
                    >
                      ✕
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>

      </Card.Body>
    </Card>
  );
}

export default ListaArray;