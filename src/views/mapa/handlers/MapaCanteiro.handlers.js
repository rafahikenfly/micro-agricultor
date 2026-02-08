import { getMapPointFromPoint, getSVGPoint } from "../../../services/svg/PointFunctions";
import { MODOS_MAPA } from "../MapaContexto";

// recebe engine e o canteiro
export function handleClickCanteiro(engine, canteiro, evt) {
  const { state } = engine;

  // só age se estamos no modo plantar e há configuração
  if (state.activeAction === MODOS_MAPA .PLANT && state.actionConfig) {
    const { mousePos, actionConfig, transform } = state;

    // ponto
    const svg = evt.target.ownerSVGElement;
    const svgPoint = getSVGPoint(svg, mousePos.x, mousePos.y)
    const mapPoint = getMapPointFromPoint(svgPoint,transform)

    console.log("Plantou no canteiro:", canteiro, svgPoint, mapPoint);
  }
  else {
    console.log(`Clicou no canteiro ${canteiro.nome} (${canteiro.id})`)
  }
}
