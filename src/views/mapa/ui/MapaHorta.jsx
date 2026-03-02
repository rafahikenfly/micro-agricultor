import { useAuth } from "../../../services/auth/authContext";
import SVGEntidade from "../../../services/svg/SVGEntidade";
import { createHortaInputHandler } from "../handlers/MapaHorta.handlers";
import { useMapaEngine } from "../MapaEngine";

export default function MapaHorta ({horta, svgRef, gRef}) {
  const { user } = useAuth();
  const engine = useMapaEngine();
  const handlers = createHortaInputHandler(engine, horta, user, svgRef, gRef)

  return (
    <SVGEntidade
      entidade={horta}
      style={{opacity: 0.50}}
      eventos={{
        onClick: (evt)=>handlers.onClick(evt),
        onMouseDown: (evt)=>handlers.onMouseDown(evt),
        onMouseMove: (evt)=>handlers.onMouseMove(evt),
        onMouseUp: (evt)=>handlers.onMouseUp(evt, horta),
      }}
    />
    )
}