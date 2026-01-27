import React from "react";

export default function VetorTab({
  value = {
    x: 0,
    y: 0,
    z: 0,
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
        X
        <input
          type="number"
          value={value.x}
          onChange={e => update("x", Number(e.target.value))}
        />
      </label>

      <label>
        Y
        <input
          type="number"
          value={value.y}
          onChange={e => update("y", Number(e.target.value))}
        />
      </label>

      <label>
        Z
        <input
          type="number"
          value={value.z}
          onChange={e => update("z", Number(e.target.value))}
        />
      </label>
    </div>
  );
}
