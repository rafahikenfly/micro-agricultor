export function calcularArea(entidade) {
  if (!entidade.dimensao) return 0;
  if (!entidade.aparencia.geometria) return 0;

  const { y, x } = entidade.dimensao;

  switch (entidade.aparencia.geometria) {
    case "rect":
      return x * y;
    case "circle": {
      const diametro = Math.min(x, y);
      const raio = diametro / 2;
      return Math.PI * raio ** 2;
    }
    case "ellipse": {
      const a = x / 2;
      const b = y / 2;
      return Math.PI * a * b;
    }
    case "polygon": {
      const pontos = entidade.aparencia.vertices;

      if (!pontos || pontos.length < 3) return 0;

      let area = 0;
      const n = pontos.length;

      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += pontos[i].x * pontos[j].y;
        area -= pontos[j].x * pontos[i].y;
      }

      return Math.abs(area) / 2;
    }

    default:
      console.warn(`Não é possível calcular área de ${entidade.aparencia.geometria}`)
      return 0;
  }
}


export function offcanvasTabHeader ({tipoEntidadeId, list = []}) {
  if (!tipoEntidadeId) return <div><strong>Sem seleção</strong></div>

  const last = list.at(-1) || null;
  const displayArea = list.reduce((acc, sel) => {
      return acc + calcularArea(sel);
    }, 0);

  let displayNome = last ? last.nome : `Sem ${tipoEntidadeId}s na seleção`
  if (list.length > 1) displayNome =
  `${last.nome} e mais ${list.length - 1} ${tipoEntidadeId}${list.length > 2 ? "s" : ""}`

  return ( <div>
      <strong>{displayNome}</strong>
      <div className="text-muted small">
          {(displayArea/10000).toFixed(2)} m²
      </div>
    </div>
  )
}