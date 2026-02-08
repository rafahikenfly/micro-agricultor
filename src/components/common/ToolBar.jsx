import { Button } from "react-bootstrap";

export default function ToolBar({ tools, activeTool }) {

  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        top: 120, // abaixo da bússola
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 10
      }}
    >
      {tools.map(tool => (
        <Button
          key={tool.id}
          variant={activeTool === tool.id ? "primary" : "outline-secondary"}
          onClick={() => tool.onClick(tool)}
        >
          {tool.label}
        </Button>
      ))}
    </div>
  );
}
