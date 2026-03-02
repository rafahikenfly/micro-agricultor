import { StandardCard } from "../../utils/formUtils";
import VetorTab from "./VetorTab";

export function EntidadeLocalizacaoTab ({ form, setForm, children }) {
  // TODO: mudar o card de dimensão conforme o tipo de geometria da aparencia
  // rect e ellipse estão ok.
  // circle: diametro
  // polygon: trazer os pontos para cá
  return (
    <>
      {children}
      <StandardCard header="Posição">
        <VetorTab formVetor={form.posicao} setVetor={(posicao) => setForm({ ...form, posicao })} />
      </StandardCard>
      <StandardCard header="Dimensão">
        <VetorTab formVetor={form.dimensao} setVetor={(dimensao) => setForm({ ...form, dimensao })} />
      </StandardCard>
    </>
  )
}