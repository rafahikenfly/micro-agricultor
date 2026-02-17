import SVGEntidade from "../../../services/svg/SVGEntidade";

export default function MapaHorta ({horta}) {

  return (
    <SVGEntidade
      entidade={horta}
      style={{opacity: 0.50}}
      eventos={{
        onClick: ()=>console.log(`Clicou na horta ${horta.nome} (${horta.id})`)
      }}
    />
    )
}