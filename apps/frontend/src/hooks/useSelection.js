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
    let newPrimary = primary;

    setSelectedKeys(prev => {
      const next = new Set(prev);

      if (next.has(key)) {
        next.delete(key);
        // Se era a primária, escolhe outra
        if (newPrimary === key) {
          const arr = Array.from(next);
          newPrimary = arr.length ? arr[arr.length - 1] : null;
        }       
      } else {
        next.add(key);
        newPrimary = key;
      }

      setPrimary(newPrimary);      
      return next;
    });

    setPrimary(prev => (prev === key ? null : key));
  };

  const isSelected = (key) => selectedKeys.has(key);

  const isPrimary = (key) => primary === key;

  const primaryType = () => {
    if (!primary) return null;
    const [type] = primary.split(":");
    return type || null;
  }
  const primaryId = () => {
    if (!primary) return null;
    const [type,id] = primary.split(":");
    return id || null;
  }


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
    isPrimary,
    hasType,
    primaryType,
    primaryId,
    getIdsByType,
  };
}