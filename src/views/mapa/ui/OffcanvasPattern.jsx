export function normalizeSelection(selection) {
  if (!selection || selection.length === 0) {
    return {
      entidade: null,
      selectionNormalizada: [],
      tipoEntidadeId: null,
    };
  }

  const entidade = selection[0].data;
  const tipoEntidadeId = selection[0].tipoEntidadeId;

  const selectionNormalizada =
    selection.length === 1
      ? selection
      : selection.filter(
          s => s.tipoEntidadeId === tipoEntidadeId
        );

  return {
    entidade,
    selectionNormalizada,
    tipoEntidadeId,
  };
}

export function offcanvasTabHeader ({selection = [], tipoEntidadeId}) {

  let entidade = null;
  let displayNome;
  let displayArea;

  // selecao vazia
  if (selection.length === 0) {
    displayNome = "Nada Selecionado";
    displayArea = 0;
  } else {
    // seleção única
    entidade = selection[0].data;
    if (selection.length === 1) {
      displayNome = entidade.nome;
      displayArea = entidade.dimensao.x/100 * entidade.dimensao.y/100; //TODO: gerenciar outras geometrias! 
    // seleção múltipla
    } else {
      displayNome = `${entidade.nome} e mais ${selection.length - 1} ${tipoEntidadeId}${selection.length > 2 ? "s" : ""}`
      displayArea = selection
      .reduce((acc, s) => {
        const { x, y } = s.data.dimensao || {};
        return acc + (Number(x/100 || 0) * Number(y/100 || 0));
      }, 0);  //TODO: gerenciar outras geometrias! 
    }
  }


  return ( <div>
      <strong>{displayNome}</strong>
      <div className="text-muted small">
          {displayArea.toFixed(2)} m²
      </div>
    </div>
  )
}