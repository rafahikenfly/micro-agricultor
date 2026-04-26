import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { VARIANTE } from "micro-agricultor";
import { useCalendarioEngine } from "../CalendarioEngine";

export default function CalendarioSidebar() {
  const { modo,
    showEventos,
    setShowEventos,
    showTarefas,
    setShowTarefas,
    setModo,
    voltar,
    avancar
  } = useCalendarioEngine();

  const tools = [
    {
      id: "agenda",
      icon: "📅",
      text: "Calendário",
      active: modo === "agenda",
      onClick: ()=>setModo("agenda"),
    },
    {
      id: "showTarefas",
      icon: "T",
      text: "Mostrar tarefas",
      active: showTarefas,
      onClick: ()=>{setShowTarefas(!showTarefas)},
    },
    {
      id: "showEventos",
      icon: "E",
      text: "Mostrar eventos",
      active: showEventos,
      onClick: ()=>{setShowEventos(!showEventos)},
    },
    {
      id: "prev",
      icon: "⬅",
      text: "Anterior",
      onClick: voltar,
    },
    {
      id: "today",
      icon: "📍",
      text: "Hoje",
      onClick:  ()=>{},
    },
    {
      id: "next",
      icon: "➡",
      text: "Próximo",
      onClick: avancar,
    },
        {
      id: "dia",
      icon: "1",
      text: "Dia",
      active: modo === "dia",
      onClick: ()=>setModo("dia"),
    },
    {
      id: "semana",
      icon: "7",
      text: "Semana",
      active: modo === "semana",
      onClick: ()=>setModo("semana"),
    },
    {
      id: "mes",
      icon: "30",
      text: "Mês",
      active: modo === "mes",
      onClick: ()=>setModo("mes"),
    },

  ];

  return (
    <div
      className="d-flex flex-column bg-light border-end p-2 align-items-center"
      style={{ width: "60px" }}
    >
      {tools.map(tool => (
        <OverlayTrigger
            key={tool.id}
            placement="right"
            overlay={<Tooltip>{tool.text}</Tooltip>}
        >
            <Button
            variant={tool.active ? VARIANTE.GREEN.variant : VARIANTE.WHITE}
            className="mb-2 d-flex align-items-center justify-content-center"
            style={{
                width: "40px",
                height: "40px",
                fontSize: "20px"
            }}
            onClick={tool.onClick}
            >
            {tool.icon}
            </Button>
        </OverlayTrigger>
      ))}
    </div>
  );
}