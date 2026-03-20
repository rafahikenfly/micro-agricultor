import { useState } from "react";

export function useSelection() {
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [primary, setPrimary] = useState(null);

  const clear = () => {
    setSelectedKeys(new Set());
    setPrimary(null);
  };

  const selectSingle = (key) => {
    setSelectedKeys(new Set([key]));
    setPrimary(key);
  };

  const add = (key) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setPrimary(key);
  };

  const toggle = (key) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });

    setPrimary(prev => (prev === key ? null : key));
  };

  const isSelected = (key) => selectedKeys.has(key);

  const hasType = (tipoEntidadeId) => {
    for (const key of selectedKeys) {
      if (key.startsWith(tipoEntidadeId + ":")) return true;
    }
    return false;
  };

  const getIdsByType = (tipoEntidadeId) => {
    const ids = [];

    for (const key of selectedKeys) {
      const [t, id] = key.split(":");

      if (t === tipoEntidadeId) ids.push(id);
    }

    return ids;
  };

  return {
    selectedKeys,
    primary,
    clear,
    selectSingle,
    add,
    toggle,
    isSelected,
    hasType,
    getIdsByType,
  };
}