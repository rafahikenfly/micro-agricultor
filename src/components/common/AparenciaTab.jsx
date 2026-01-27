import React from "react";

export default function AparenciaTab({
  value = {
    fundo: "#4CAF50",
    borda: "#1B5E20",
    espessura: 2,
    elipse: false
  },
  onChange
}) {
  const update = (field, v) => {
    onChange({
      ...value,
      [field]: v
    });
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <label>
        Cor de fundo
        <input
          type="color"
          value={value.fundo}
          onChange={e => update("fundo", e.target.value)}
        />
      </label>

      <label>
        Cor da borda
        <input
          type="color"
          value={value.borda}
          onChange={e => update("borda", e.target.value)}
        />
      </label>

      <label>
        Espessura da borda
        <input
          type="number"
          min="1"
          value={value.espessura}
          onChange={e => update("espessura", Number(e.target.value))}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={value.elipse}
          onChange={e => update("elipse", e.target.checked)}
        />
        Desenhar como elipse
      </label>
    </div>
  );
}
