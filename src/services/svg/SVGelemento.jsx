export default function SVGElemento ({item, onClick, destaque}) {

  /* ============== CONVERSÃO DE ARRAY DE VERTICES ============== */



  if (item.aparencia?.vertices && item.aparencia?.vertices.length > 2) {
    const polygonPoints = item.aparencia.vertices
    .map(v => `${v.x},${v.y}`)
    .join(" ");
  
    return (
      <polygon
        key={item.id}
        points={polygonPoints}
        fill={item.aparencia?.fundo || "000000"}
        stroke={item.aparencia?.borda || "000000"}
        strokeWidth={item.aparencia?.espessura || 0.05}
        opacity = {destaque ? 1 : 0.5}
        onClick={()=>onClick(item)}
      />
    )
  }
  if (item.aparencia?.elipse) {
    return (
      <ellipse
        key={item.id}
        cx={item.posicao.x}
        cy={item.posicao.y}
        rx={item.dimensao.x / 2}
        ry={item.dimensao.y / 2}
        fill={item.aparencia?.fundo || "000000"}
        stroke={item.aparencia?.borda || "000000"}
        strokeWidth={item.aparencia?.espessura || 0.05}
        opacity = {destaque ? 1 : 0.5}
        onClick={()=>onClick(item)}
      />
    );
  }
  return (
    <rect
      key={item.id}
      x={item.posicao.x}
      y={item.posicao.y}
      width={item.dimensao.x}
      height={item.dimensao.y}
      fill={item.aparencia?.fundo || "000000"}
      stroke={item.aparencia?.borda || "000000"}
      strokeWidth={item.aparencia?.espessura || 0.05}
      opacity = {destaque ? 1 : 0.5}
      onClick={()=>onClick(item)}
    />
  );
}