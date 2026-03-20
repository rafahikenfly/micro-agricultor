const aparenciaPadrao = {
  fundo: "#000000",
  borda: "#FFFFFF",
  espessura: 3,
}

export default function SVGEntidade ({entidade, style, eventos, pos = {}, dim = {}}) {
  const hasEventos = eventos && Object.keys(eventos).length > 0  
  const pointerEvents = hasEventos ? undefined : "none"

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
        pointerEvents={pointerEvents}
        {...style}
        {...eventos}
      />
    )
  }
  else if (entidade.aparencia?.geometria === "ellipse") {
    return (
      <ellipse
        cx={pos.x ?? entidade.posicao.x}
        cy={pos.y ?? entidade.posicao.y}
        rx={dim.x ?? entidade.dimensao.x / 2}
        ry={dim.y ?? entidade.dimensao.y / 2}
        fill={entidade.aparencia?.fundo || aparenciaPadrao.fundo}
        stroke={entidade.aparencia?.borda || aparenciaPadrao.borda}
        strokeWidth={entidade.aparencia?.espessura || aparenciaPadrao.espessura}
        pointerEvents={pointerEvents}
        {...style}
        {...eventos}
      />
    );
  }
  else if (entidade.aparencia?.geometria === "rect") {
    return (
      <rect
        x={pos.x ?? entidade.posicao.x - (entidade.dimensao.x/2)}
        y={pos.y ?? entidade.posicao.y - (entidade.dimensao.y/2)}
        width={dim.x ?? entidade.dimensao.x}
        height={dim.y ?? entidade.dimensao.y}
        fill={entidade.aparencia?.fundo || aparenciaPadrao.fundo}
        stroke={entidade.aparencia?.borda || aparenciaPadrao.borda}
        strokeWidth={entidade.aparencia?.espessura || aparenciaPadrao.espessura}
        pointerEvents={pointerEvents}
        {...style}
        {...eventos}
      />
    ); 
  }
  else if (entidade.aparencia?.geometria === "circle") {
    return (
      <circle
        cx={pos.x ?? entidade.posicao.x}
        cy={pos.y ?? entidade.posicao.y}
        r={Math.max(dim.x ?? entidade.dimensao.x, dim.y ?? entidade.dimensao.y)/2}
        fill={entidade.aparencia?.fundo || aparenciaPadrao.fundo}
        stroke={entidade.aparencia?.borda || aparenciaPadrao.borda}
        strokeWidth={entidade.aparencia?.espessura || aparenciaPadrao.espessura}
        pointerEvents={pointerEvents}
        {...style}
        {...eventos}
      />
    );
  }
  else {
    console.warn ("Geometria da entidade desconhecida", entidade);
    return null;
  }
}