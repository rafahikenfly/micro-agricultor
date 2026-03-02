import { useState, useEffect } from "react";
import { Offcanvas, Form, Button } from "react-bootstrap";
import { catalogosService } from "../../../services/catalogosService";
import { handleSelectIdNome, renderOptions, StandardInput } from "../../../utils/formUtils";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import { ISOToReadableString, toDateTimeLocal, } from "../../../utils/dateUtils";
import { getDimensaoVariedade } from "../../../../shared/domain/variedade.rules";

export default function PlantarOffcanvas({ show, onClose, onConfirm, onCancel }) {
  const [especie, setEspecie] = useState(null);
  const [variedade, setVariedade] = useState(null);
  const [tecnica, setTecnica] = useState(null);
  const [linhas, setLinhas] = useState(1);
  const [colunas, setColunas] = useState(1);
  const [espacamentoX, setEspacamentoX] = useState(30); // cm
  const [espacamentoY, setEspacamentoY] = useState(30); // cm
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  const [grid, setGrid] = useState(1);
  
  //CATALOGOS
  const [especies, setEspecies] = useState([]);
  const [variedades, setVariedades] = useState([]);
  const [reading, setReading] = useState(false);

  /* ================= CARREGAR DADOS ================= */
  useEffect(() => {
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getEspecies(),
      catalogosService.getVariedades(),
    ]).then(([esps,vars]) => {
      if (!ativo) return;
  
      setEspecies(esps);
      setVariedades(vars);
      setReading(false);
    });
  
    return () => { ativo = false };
  }, []);

  /* ============== SELECAO DE VARIEDADE/TECNICA UNICA ============== */
  useEffect(() => {
    if (!especie || !variedades.length) return;

    const varsDaEspecie = variedades.filter(v => v.especieId === especie.id);
    if (varsDaEspecie.length === 1) setVariedade(varsDaEspecie[0]);   // auto seleciona
    else setVariedade(null);                                          // força seleção manual

    const tecnicasDaEspecie = especie.ciclo.filter(c => c.plantavel);
    if (tecnicasDaEspecie.length === 1) setVariedade(tecnicasDaEspecie[0]); // auto seleciona
    else setVariedade(null);                                                // força seleção manual
  }, [especie, variedades]);

  
  const handleConfirm = () => {
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();
    const placingConfig = {
      timestamp,
      tipoEntidadeId: "planta",
      layout: {
        linhas: Number(linhas),
        colunas: Number(colunas),
        espacamentoColuna: Number(espacamentoX),
        espacamentoLinha: Number(espacamentoY),
      },
      metadata: {
        especie,
        tecnica,
        variedade,
      }
    };

    const dimensaoVariedade = getDimensaoVariedade(variedade);

    //TODO: Isso funciona para rect e para circle, mas não para ellipse e polygon
    const preview = {
      geometria: variedade.aparencia.geometria,
      width:  dimensaoVariedade.x,
      height: dimensaoVariedade.y,
      radius: Math.max(dimensaoVariedade.x, dimensaoVariedade.y)/2,
      serving: "place",
      grid,
    };

    onConfirm(placingConfig, preview);
    onClose();
  };

  const handleCancel =() => {
    onCancel();
    onClose();
  }

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>🌱 Plantar</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <Form>
          <StandardInput label="Data/hora" width="120px">
            <Form.Control
              type="datetime-local"
              value={stringTimestamp}
              onChange={(e)=> setStringTimestamp(e.target.value)}
            />
          </StandardInput>
          <StandardInput label="Espécie" width="120px">
            <Form.Select
              value={especie?.id || ""}
              onChange={(e) => setEspecie(especies.find((es) => es.id === e.currentTarget.value))}>
              {renderOptions({
                list: especies,
                loading: reading,
                placeholder: "Selecione a espécie",
              })}
            </Form.Select>
          </StandardInput>

          <StandardInput label="Técnica" width ="120px">
            <Form.Select
              value={tecnica?.estagioId || ""}
              onChange={(e) => handleSelectIdNome(e,{
                list: especie.ciclo.filter((c)=>c.plantavel),
                idKey: "estagioId",
                nomeKey: "estagioNome",
                fieldId: "estagioId",
                fieldNome: "estagioNome",
                setForm: setTecnica,
              })}
            >
              {especie?.ciclo && renderOptions({
                list: especie.ciclo.filter((c)=>c.plantavel),
                loading: reading,
                placeholder: "Selecione a técnica de plantio",
                valueKey: "estagioId",
                labelKey: "estagioNome",
              })}
            </Form.Select>
          </StandardInput>
          <StandardInput label="Variedade" width="120px">
            <Form.Select
              value={variedade?.id || ""}
              onChange={(e) => {
                const sel = variedades.find(v => v.id === e.currentTarget.value);
                setVariedade(sel)
                setEspacamentoY(sel?.espacamento.y || 30)
                setEspacamentoX(sel?.espacamento.x || 30)
              }}>
              {renderOptions({
                list: variedades.filter((v)=> v.especieId === especie?.id),
                loading: reading,
                placeholder: "Selecione a variedade",
              })}
            </Form.Select>
          </StandardInput>

          <StandardInput label="Layout" unidade="un" width="120px" unidadeWidth="40px">
            <Form.Control
              type="number"
              min={1}
              value={linhas}
              onChange={(e) => setLinhas(e.target.value)}
              placeholder="Linhas"
            />
            <InputGroupText> x </InputGroupText>
            <Form.Control
              type="number"
              min={1}
              value={colunas}
              onChange={(e) => setColunas(e.target.value)}
              placeholder="Colunas"
            />
          </StandardInput>

          <StandardInput label="Espaçamento" unidade="cm" width="120px" unidadeWidth="40px">
            <Form.Control
              type="number"
              min={5}
              value={espacamentoY}
              onChange={(e) => setEspacamentoY(e.target.value)}
            />
            <InputGroupText> x </InputGroupText>
            <Form.Control
              type="number"
              min={5}
              value={espacamentoX}
              onChange={(e) => setEspacamentoX(e.target.value)}
            />
          </StandardInput>
          <StandardInput label="Grade" width="120px" unidade="cm" unidadeWidth="40px">
            <Form.Control
              type="number"
              step="1"
              value={grid}
              onChange={(e) => setGrid(Number(e.target.value))}
            />
          </StandardInput>

          <div className="p-2 border rounded bg-light mb-3">
            <strong>Resumo do plantio</strong>
            <div>Data/Hora: {ISOToReadableString(stringTimestamp)}</div>
            <div>Espécie: {especie?.nome || "-"}</div>
            <div>Técnica: {tecnica?.estagioNome || "-"}</div>
            <div>Variedade: {variedade?.nome || "-"}</div>
            <div>Quantidade: {linhas * colunas || 0} plantas</div>
            <div>Layout: {linhas} x {colunas}</div>
            <div>Espaçamento: {espacamentoY} x {espacamentoX} cm</div>
            <div>Alinhar à grade de {grid}cm</div>
          </div>

          <div className="d-grid gap-2">
            <Button
              variant="success"
              disabled={!stringTimestamp || !especie || !tecnica || !variedade}
              onClick={handleConfirm}
            >
              Plantar
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}