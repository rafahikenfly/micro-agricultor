import { unixToReadableString } from "../../../utils/dateUtils";
import { useCalendarioEngine } from "../CalendarioEngine";

export default function CalendarioEvento({ evento }) {
  const { selecionarItem, itemSelecionado } = useCalendarioEngine();

  const isSelected =
    itemSelecionado?.id === evento.id &&
    itemSelecionado?.type === "evento";

  return (
    <div
      className={`cal-item cal-evento ${isSelected ? "selected" : ""}`}
      onClick={() =>
        selecionarItem({ id: evento.id, type: "evento" })
      }
    >
      <div className="cal-title">
        {evento.nome || evento.tipoEventoNome}
      </div>

      <div className="cal-time">
        {unixToReadableString(evento.timestamp)}
      </div>
    </div>
  );
}