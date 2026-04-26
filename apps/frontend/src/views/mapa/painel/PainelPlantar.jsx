import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import { ISOToReadableString, toDateTimeLocal, } from "../../../utils/dateUtils";
import { ENTIDADE, getDimensaoVariedade } from "micro-agricultor";
import { useMapaEngine } from "../MapaEngine";
import { useCache } from "../../../hooks/useCache";

export default function PainelPlantar({ data = {}, onClose, onConfirm, onCancel }) {
  const { previewSetup } = useMapaEngine()
  const { cacheEspecies, cacheVariedades, cacheEstagiosEspecie, reading } = useCache([
    "especies",
    "variedades",
    "estagiosEspecie"
  ]) 
  // Carrega a última configuração da ferramenta
  // Timestamp não é carregado
  const [especie, setEspecie] = useState(data.metadata?.especie ?? {});
  const [variedade, setVariedade] = useState(data.metadata?.variedade ?? {});
  const [tecnica, setTecnica] = useState(data.metadata?.tecnica ?? {});
  const [linhas, setLinhas] = useState(previewSetup.layout?.linhas ?? 1);
  const [colunas, setColunas] = useState(previewSetup.layout?.colunas ?? 1);
  const [espacamentoColuna, setEspacamentoColuna] = useState(previewSetup.layout?.espacamentoColuna ?? 30); // cm
  const [espacamentoLinha, setEspacamentoLinha] = useState(previewSetup.layout?.espacamentoLinha ?? 30); // cm
  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  const [grid, setGrid] = useState(1);
  
  /* ============== SELECAO DE VARIEDADE/TECNICA UNICA ============== */
  useEffect(() => {
    //TODO: NA ABERTURA DO COMPONENTE, ESTÁ RODANDO ESSE EFFECT E TIRANDO A SELECAO DA VARIEDADE
    if (!especie.id || !cacheVariedades?.list.length) return;

    const varsDaEspecie = cacheVariedades?.list.filter(v => v.especieId === especie.id);
    if (varsDaEspecie.length === 1) setVariedade(varsDaEspecie[0]);   // auto seleciona
    else setVariedade(null);                                          // força seleção manual

    const tecnicasDaEspecie = especie.ciclo.filter(c => c.plantavel);
    if (tecnicasDaEspecie.length === 1) setVariedade(tecnicasDaEspecie[0]); // auto seleciona
    else setVariedade(null);                                                // força seleção manual
  }, [especie, cacheVariedades]);

  
  const handleConfirm = () => {
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();
    const toolState = {
      timestamp,
      tipoEntidadeId: ENTIDADE.planta.id,
      grid,
      metadata: {
        especie,
        tecnica,
        variedade,
      }
    };

    const dimensao = getDimensaoVariedade(variedade);

    //TODO: Isso funciona para rect e para circle, mas não para ellipse e polygon
    const layout = {
      dimensao,
      linhas: Number(linhas),
      colunas: Number(colunas),
      espacamentoColuna: Number(espacamentoColuna),
      espacamentoLinha: Number(espacamentoLinha),
    };

    onConfirm(toolState, layout);
    onClose();
  };

  const handleCancel =() => {
    onCancel();
    onClose();
  }

  return (
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
          onChange={(e) => setEspecie(cacheEspecies?.map.get(e.currentTarget.value))}>
          {renderOptions({
            list: cacheEspecies?.list,
            loading: reading,
            placeholder: "Selecione a espécie",
          })}
        </Form.Select>
      </StandardInput>

      <StandardInput label="Variedade" width="120px">
        <Form.Select
          value={variedade?.id || ""}
          onChange={(e) => {
            const sel = cacheVariedades?.map.get(e.currentTarget.value);
            setVariedade(sel)
            setEspacamentoLinha(sel?.espacamento.y || 30)
            setEspacamentoColuna(sel?.espacamento.x || 30)
          }}>
          {renderOptions({
            list: cacheVariedades?.list.filter((v)=> v.especieId === especie?.id),
            loading: reading,
            placeholder: "Selecione a variedade",
          })}
        </Form.Select>
      </StandardInput>

      <StandardInput label="Técnica" width ="120px">
        <Form.Select
          value={tecnica?.estagioId || ""}
          onChange={(e) => {
            const estagioIndex = e.target.value;
            const estagioId = especie.ciclo[estagioIndex].estagioId
            const estagio = cacheEstagiosEspecie?.map.get(estagioId)
            setTecnica({
              estagioId,
              estagioIndex,
              visivelNoMapa: estagio.propriedades?.visivelNoMapa ?? true,
              estadoId: "HLRvq5eExZAiKSZOcnaF" //TODO: tirar de hardcode, colocar um selectbox
            })
          }}
        >
          <option value="" disabled>Selecione a técnica de plantio</option>
          {(especie?.ciclo ?? []).map((c, idx) => {
            if (c.plantavel) return (
            <option key={idx} value={idx}>
              {cacheEstagiosEspecie?.map.get(c.estagioId).nome ?? c.estagioId /**cacheEstagiosEspecie?.map( )?.nome*/}
            </option>
          )})}
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
          value={espacamentoLinha}
          onChange={(e) => setEspacamentoLinha(e.target.value)}
        />
        <InputGroupText> x </InputGroupText>
        <Form.Control
          type="number"
          min={5}
          value={espacamentoColuna}
          onChange={(e) => setEspacamentoColuna(e.target.value)}
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
        <div>Variedade: {variedade?.nome || "-"}</div>
        <div>Técnica: {cacheEstagiosEspecie?.map.get(tecnica?.estagioId)?.nome || "-"}</div>
        <div>Quantidade: {linhas * colunas || 0} plantas</div>
        <div>Layout: {linhas} x {colunas}</div>
        <div>Espaçamento: {espacamentoLinha} x {espacamentoColuna} cm</div>
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
  );
}