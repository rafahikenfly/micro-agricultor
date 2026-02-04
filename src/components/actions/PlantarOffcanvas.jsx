import { useState, useEffect } from "react";
import { Offcanvas, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { catalogosService } from "../../services/catalogosService";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";
import InputGroupText from "react-bootstrap/esm/InputGroupText";

export default function PlantarOffcanvas({ show, onClose, onConfirm }) {
  const [especie, setEspecie] = useState(null);
  const [variedade, setVariedade] = useState(null);
  const [tecnica, setTecnica] = useState(null);
  const [linhas, setLinhas] = useState(1);
  const [colunas, setColunas] = useState(1);
  const [espacamentoX, setEspacamentoX] = useState(30); // cm
  const [espacamentoY, setEspacamentoY] = useState(30); // cm
  
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
    const configPlantio = {
      especie,
      tecnica,
      variedade,
      layout: {
        linhas: Number(linhas),
        colunas: Number(colunas),
        espacamentoColuna: Number(espacamentoX),
        espacamentoLinha: Number(espacamentoY),
      }
    };

    onConfirm(configPlantio);
    onClose();
  };

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>🌱 Plantar</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <Form>
          {/* Espécie */}
          <Form.Group className="mb-3">
            <Form.Label>Espécie</Form.Label>
            <Form.Select
              value={especie?.id || ""}
              onChange={(e) => setEspecie(especies.find((es) => es.id === e.currentTarget.value))}>
              {renderOptions({
                list: especies,
                loading: reading,
                placeholder: "Selecione a espécie",
              })}
            </Form.Select>
          </Form.Group>

          {/* Técnica */}
          <Form.Group className="mb-3">
            <Form.Label>Técnica de plantio</Form.Label>
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
          </Form.Group>

          {/* Variedade */}
          <Form.Group className="mb-3">
            <Form.Label>Variedade</Form.Label>
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
          </Form.Group>

          {/* Layout */}
          <Form.Group className="mb-3">
            <Form.Label>Layout</Form.Label>
            <Row>
              <Col>
                <Form.Control
                  type="number"
                  min={1}
                  value={linhas}
                  onChange={(e) => setLinhas(e.target.value)}
                  placeholder="Linhas"
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  min={1}
                  value={colunas}
                  onChange={(e) => setColunas(e.target.value)}
                  placeholder="Colunas"
                />
              </Col>
            </Row>
          </Form.Group>

          {/* Espaçamento */}
          <InputGroup className="mb-3">
            <InputGroupText>Espaçamento (cm)</InputGroupText>
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
          </InputGroup>

          {/* Preview semântico */}
          <div className="p-2 border rounded bg-light mb-3">
            <strong>Resumo do plantio</strong>
            <div>Espécie: {especie?.nome || "-"}</div>
            <div>Técnica: {tecnica?.estagioNome || "-"}</div>
            <div>Variedade: {variedade?.nome || "-"}</div>
            <div>Quantidade: {linhas * colunas || 0} plantas</div>
            <div>Layout: {linhas} x {colunas}</div>
            <div>Espaçamento: {espacamentoY} x {espacamentoX} cm</div>
          </div>

          <div className="d-grid">
            <Button
              variant="success"
              disabled={!especie || !tecnica || !variedade}
              onClick={handleConfirm}
            >
              Entrar em modo plantio
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}