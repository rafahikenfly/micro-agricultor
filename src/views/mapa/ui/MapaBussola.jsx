import SVGBussola from "../../../services/svg/SVGbussola";
import { useMapaEngine } from "../MapaEngine";

export default function MapaBussola() {
    const engine = useMapaEngine()
    const { transform } = engine.state
    return (
          <div
            style={{
              position: "absolute",
              left: "6vw",
              top: "7vw",
              width: 80,
              height: 80,
            }}
          >
            <SVGBussola
              diametro={80}
              orientacao={transform.rotate}
            />
          </div>
    )
}