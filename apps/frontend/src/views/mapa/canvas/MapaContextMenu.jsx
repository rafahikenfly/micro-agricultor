import "./MapaContextMenu.css";

export default function MapaContextMenu({ x, y, opcoes }) {
  return (
    <div
      className="mapa-context-menu"
      style={{ left: x, top: y }}
      role="menu"
    >
      {opcoes.map((opcao, index) => (
        <button
          key={"opcao-"+index}
          type="button"
          role="menuitem"
          onClick={opcao.onClick}
        >
          {opcao.label}
        </button>
      ))}
    </div>
  );
}