import { useEffect, useState } from "react";
import { Form, Button, InputGroup, } from "react-bootstrap";
import { catalogosService } from "../../services/catalogosService";

export default function MonitorarTab({ entidade, tipoEntidade }) {
  const [caracteristicas_canteiro, setCaracteristicas_canteiro] = useState([]);
  const [caracteristicas_planta, setCaracteristicas_planta] = useState([]);
  const [form, setForm] = useState({});
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);


  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    let ativo = true;
    setLoadingCatalogos(true);
  
    Promise.all([
      catalogosService.getCaracteristicas_canteiro(),
      catalogosService.getCaracteristicas_planta(),
    ]).then(([canc,plnc]) => {
      if (!ativo) return;
      setCaracteristicas_canteiro(canc);
      setCaracteristicas_planta(plnc);
      setLoadingCatalogos(false);
    });
  
    return () => { ativo = false };
  }, []);

  const aplicarInspecao = async () => {
//    setLoadingCatalogos(true);
    console.log(form)
  };

  const caracteristicasArr = tipoEntidade === "Canteiro" ? 
                                caracteristicas_canteiro :
                                tipoEntidade === "Planta" ?
                                caracteristicas_planta :
                                [];
  return (
    <div className="p-3"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
          {caracteristicasArr.map((c) => {
            const item = form[c.id] ?? { valor: 0, atualizar: false };
            return (
              <Form.Group className="mb-2" key={c.id}>
                <Form.Label>
                  {c.nome}
                </Form.Label>
                { c.unidade && <Form.Text muted>({c.unidade})</Form.Text> }
                <InputGroup>
                  <Form.Control
                    type="number"
                    value={item.valor}
                    onChange={(e) => setForm({...form, [c.id]: {...item, valor: Number(e.currentTarget.value), atualizar: true}})}
                  />
                  <Form.Check
                    label="Atualizar"
                    checked={item.atualizar}
                    onChange={(e) => setForm({...form, [c.id]: {...item, atualizar: e.currentTarget.checked}})}
                  />
                </InputGroup>
              </Form.Group>
            )
          })}
      <Button
        variant="success"
        className="mt-3 w-100"
        disabled={loadingCatalogos}
        onClick={aplicarInspecao}
      >
        Aplicar inspeção
      </Button>
    </div>
  );
}
