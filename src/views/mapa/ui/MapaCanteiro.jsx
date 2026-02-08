import SVGEntidade from "../../../services/svg/SVGEntidade";
import { handleClickCanteiro } from "../handlers/MapaCanteiro.handlers";
import { useMapaEngine } from "../MapaEngine";

export default function MapaCanteiro ({canteiro}) {
  const engine = useMapaEngine();

  return (
    <SVGEntidade
      entidade={canteiro}
      eventos={{
        onClick: (evt) => handleClickCanteiro(engine, canteiro, evt),
      }}
    />
  )
}