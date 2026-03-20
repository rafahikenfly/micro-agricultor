import ToolBar from "../../../components/common/ToolBar";
import { useCalendarioEngine } from "../CalendarioEngine";

export default function CalendarioToolbar() {
  const {
    isAgenda,
    toggleModo,
    anterior,
    tamanho,
    proximo,
    irParaHoje,
    setShowEventos,
    setShowTarefas,
    showTarefas,
    showEventos,
    filtros,
  } = useCalendarioEngine();

  const tools = [
    {
      id: "modo",
      label: isAgenda ? "📅" : "🗓",
      onClick: toggleModo,
    },
    {
      id: "showTarefas",
      label: showTarefas ? "T" : "NT",
      onClick: ()=>setShowTarefas(!showTarefas)
    },
    {
      id: "showEventos",
      label: showEventos ? "E" : "NE",
      onClick: ()=>setShowEventos(!showEventos)
    },
    {
      id: "prev",
      label: "⬅",
      onClick: anterior,
    },
    {
      id: "today",
      label: "📍",
      onClick: irParaHoje,
    },
    {
      id: "next",
      label: "➡",
      onClick: proximo,
    },
    {
      id: "dia",
      label: "1",
      onClick: ()=>tamanho("dia"),
    },
    {
      id: "semana",
      label: "7",
      onClick: ()=>tamanho("semana"),
    },
    {
      id: "mes",
      label: "30",
      onClick: ()=>tamanho("mes"),
    },
  ];

  return (
    <ToolBar
      tools={tools}
      activeTool={isAgenda ? "agenda" : "mes"}
    />
  );
}