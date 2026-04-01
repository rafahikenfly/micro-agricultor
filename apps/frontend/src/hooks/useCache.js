import { useEffect, useState } from "react";
import { cacheService } from "../services/cacheService";

export function useCache(keys = []) {
  const [data, setData] = useState({});
  const [reading, setReading] = useState(false);

  const key = keys.sort().join(",");

  useEffect(() => {
    if (!keys || keys.length === 0) return;

    let ativo = true;
    setReading(true);

    const loaders = keys.map(name => {
      const fn = cacheService[`get${capitalize(name)}`];
      if (!fn) throw new Error(`Cache ${name} não existe no cacheService`);
      return fn();
    });

    Promise.all(loaders)
      .then(results => {
        if (!ativo) return;

        const obj = {};
        keys.forEach((name, i) => {
          obj[`cache${capitalize(name)}`] = results[i];
        });

        setData(obj);
      })
      .catch(err => {
        console.error("Erro ao carregar cache:", err);
      })
      .finally(() => {
        if (ativo) setReading(false);
      });

    return () => { ativo = false };

  }, [key]);

  return { ...data, reading };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}