import { useAuth } from "../../../services/auth/authContext";
import SVGEntidade from "../../../services/svg/SVGEntidade";

export default function MapaHorta ({horta, svgRef, gRef}) {
  const { user } = useAuth();

  return (
    <SVGEntidade
      entidade={horta}
      style={{opacity: 0.50}}
      />
    )
}