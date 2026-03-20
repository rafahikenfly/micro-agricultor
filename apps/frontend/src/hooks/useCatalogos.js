import { useEffect, useState } from "react";
import { catalogosService } from "../services/catalogosService";

export function useCatalogos(catalogos = []) {
  const [data, setData] = useState({});
  const [reading, setReading] = useState(false);

  const key = catalogos.sort().join(",");

  useEffect(() => {
    if (!catalogos || catalogos.length === 0) return;

    let ativo = true;
    setReading(true);

    const loaders = catalogos.map(name => {
      const fn = catalogosService[`get${capitalize(name)}`];
      if (!fn) throw new Error(`Catálogo ${name} não existe no catalogosService`);
      return fn();
    });

    Promise.all(loaders)
      .then(results => {
        if (!ativo) return;

        const obj = {};
        catalogos.forEach((name, i) => {
          obj[`catalogo${capitalize(name)}`] = results[i];
        });

        setData(obj);
      })
      .catch(err => {
        console.error("Erro ao carregar catálogos:", err);
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