import { Card, Form, InputGroup } from "react-bootstrap";
import { renderOptions, StandardCard, StandardInput } from "../../utils/formUtils";
import { GEOMETRIAS } from "../../utils/consts/GEOMETRIAS";
import { TIPOS_EFEITO } from "../../utils/consts/TIPOS_EFEITO";
import AparenciaTab from "../common/AparenciaTab";

export default function CvJobSpecsOutputTab({
  modelType,
  formOutput,
  setFormOutput,
  loading,
  classes = [],
  estados = [],
  caracteristicas = [],
}) {
  return (
    <>
      <StandardCard header="Regra de Saída">
          {modelType === "counting" && (
            <>
              <StandardInput label="Classe a ser contada" width="35%">
                <Form.Select
                  value={formOutput.classeContada ?? ""}
                  onChange={e => setFormOutput({...formOutput, classeContada: Number(e.target.value)})}
                >
                  {renderOptions({
                    list: classes,
                    placeholder: "Selecione uma classe para contagem",
                    loading,
                  })}
                </Form.Select>
              </StandardInput>

              <StandardInput label="Característica Afetada" width="35%">
                <Form.Select
                  value={formOutput.caracteristicaAfetada ?? ""}
                  onChange={e => setFormOutput({...formOutput, caracteristicaAfetada: e.target.value})}
                >
                  {renderOptions({
                    placeholder: "Selecione a característica",
                    list: caracteristicas,
                    loading: loading,
                    nullOption: true,
                  })}
                </Form.Select>
              </StandardInput>
              <StandardInput label="Operação" width="35%">
                <Form.Select
                  value={formOutput.operacao ?? ""}
                  onChange={e => setFormOutput({...formOutput, operacao: e.target.value})}
                >
                  {renderOptions({
                    placeholder: "Selecione a operação",
                    list: TIPOS_EFEITO,
                    loading: false,
                    nullOption: true,
                  })}
                </Form.Select>
              </StandardInput>
            </>
          )}

          {modelType === "comparator" && (
            <>
              <Form.Label>Catálogo</Form.Label>
              <Form.Control
                value={formOutput.catalogo ?? ""}
                onChange={e => setFormOutput({...formOutput, catalogo: e.target.value})}
              />

              <Form.Label className="mt-2">Filtro</Form.Label>
              <Form.Control
                value={formOutput.filtro ?? ""}
                onChange={e => setFormOutput({...formOutput, filtro: e.target.value})}
              />

              <Form.Label className="mt-2">Ações</Form.Label>
              <Form.Control
                placeholder="Ao encontrar nova"
                value={formOutput.onNew ?? ""}
                onChange={e => setFormOutput({...formOutput, onNew: e.target.value})}
              />
              <Form.Control
                className="mt-2"
                placeholder="Ao encontrar previsto"
                value={formOutput.onFound ?? ""}
                onChange={e => setFormOutput({...formOutput, onFound: e.target.value})}
              />
              <Form.Control
                className="mt-2"
                placeholder="Ao não encontrar previsto"
                value={formOutput.onNotFound ?? ""}
                onChange={e => setFormOutput({...formOutput, onNotFound: e.target.value})}
              />
            </>
          )}

        </StandardCard>
        <StandardCard header="Entidade Afetada">
          <StandardInput label="Estado Resultante">
            <Form.Select
              value={formOutput.estadoId ?? ""}
              onChange={e => {
                const estado = estados.find(x => x.id === e.target.value);
                setFormOutput(prev => ({
                  ...prev,
                  estadoId: estado?.id,
                  estadoNome: estado?.nome,
                }));
              }}
            >
              {renderOptions({
                list: estados,
                loading,
                placeholder: "Nenhuma alteração no estado da entidade",
                nullOption: true,
              })}
            </Form.Select>
          </StandardInput>
        </StandardCard>
        <AparenciaTab
          formAparencia={formOutput.aparencia}
          setFormAparencia={(aparencia)=>setFormOutput({...formOutput, aparencia})}
        />

    </>
  );
}
