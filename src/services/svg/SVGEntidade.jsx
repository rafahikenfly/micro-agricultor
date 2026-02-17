const aparenciaPadrao = {
  fundo: "#000000",
  borda: "#FFFFFF",
  espessura: 3,
}

export default function SVGEntidade ({key, entidade, style, eventos}) {
  //console.log("SVGENTIDADE RENDER:", entidade.nome);
  /* ============== CONVERSÃO DE ARRAY DE VERTICES ============== */
  if (entidade.aparencia?.geometria === "polygon" && entidade.aparencia?.vertices?.length > 2) {
    const polygonPoints = entidade.aparencia.vertices
    .map(v => `${v.x},${v.y}`)
    .join(" ");
    return (
      <polygon
        points={polygonPoints}
        fill={entidade.aparencia?.fundo || aparenciaPadrao.fundo}
        stroke={entidade.aparencia?.borda || aparenciaPadrao.borda}
        strokeWidth={entidade.aparencia?.espessura || aparenciaPadrao.espessura}
        {...style}
        {...eventos}
      />
    )
  }
  else if (entidade.aparencia?.geometria === "ellipse") {
    return (
      <ellipse
//        key={item.id}
        cx={entidade.posicao.x}
        cy={entidade.posicao.y}
        rx={entidade.dimensao.x / 2}
        ry={entidade.dimensao.y / 2}
        fill={entidade.aparencia?.fundo || aparenciaPadrao.fundo}
        stroke={entidade.aparencia?.borda || aparenciaPadrao.borda}
        strokeWidth={entidade.aparencia?.espessura || aparenciaPadrao.espessura}
        {...style}
        {...eventos}
      />
    );
  }
  else if (entidade.aparencia?.geometria === "rect") {
    return (
      <rect
//        key={item.id}
        x={entidade.posicao.x - (entidade.dimensao.x/2)}
        y={entidade.posicao.y - (entidade.dimensao.y/2)}
        width={entidade.dimensao.x}
        height={entidade.dimensao.y}
        fill={entidade.aparencia?.fundo || aparenciaPadrao.fundo}
        stroke={entidade.aparencia?.borda || aparenciaPadrao.borda}
        strokeWidth={entidade.aparencia?.espessura || aparenciaPadrao.espessura}
        {...style}
        {...eventos}
      />
    );
  }
  else if (entidade.aparencia?.geometria === "circle") {
    return (
      <circle
//        key={item.id}
        cx={entidade.posicao.x}
        cy={entidade.posicao.y}
        r={Math.max(entidade.dimensao.x, entidade.dimensao.y) / 2}   // raio = diâmetro / 2
        fill={entidade.aparencia?.fundo || aparenciaPadrao.fundo}
        stroke={entidade.aparencia?.borda || aparenciaPadrao.borda}
        strokeWidth={entidade.aparencia?.espessura || aparenciaPadrao.espessura}
        {...style}
        {...eventos}
      />
    );
  }
  else {
    console.error ("Geometria da entidade desconhecida", entidade);
    return null;
  }
}