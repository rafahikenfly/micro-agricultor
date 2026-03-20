import SVGBussola from "../../../services/svg/SVGbussola";

export default function MapaBussola({orientacao = 0, rotacao = 0}) {
  const proa = orientacao - rotacao;
  return (
    <div
      style={{
        position: "absolute",
        right: `20px`,
        bottom: `20px`,
        width: 80,
        height: 80,
      }}
    >
      <SVGBussola
        diametro={80}
        orientacao={proa}
      />
    </div>
  )
}