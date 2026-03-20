import { Button, Card, Form, InputGroup, Row, Stack } from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import { catalogosService } from "../services/catalogosService";
import ListaAcoes from "../components/common/ListaAcoes";
import Loading from "../components/Loading";

export const handleSelectIdNome = (e, {
    list,
    setForm,
    fieldId,
    fieldNome,
    idKey = "id",
    nomeKey = "nome",
  }
) => {
  const selectedId = e.target.value;
  const selectedItem = list.find(i => String(i[idKey]) === String(selectedId));

  setForm(prev => ({
    ...prev,
    [fieldId]: selectedId,
    [fieldNome]: selectedItem ? selectedItem[nomeKey] : "",
  }));
};
export const renderOptions = ({
  list,
  loading = false,
  placeholder = "Selecione",
  valueKey = "id",
  labelKey = "nome",
  disabledKey = "isArchived",
  isOptionDisabled,
  nullOption = false,
}) => {
  if (loading) {
    return <option>Carregando...</option>;
  }

  return (
    <>
      <option value="" disabled={!nullOption}>
        {placeholder}
      </option>

      {(list || []).map((item, idx) => {
        const isString = typeof item === "string";

        const value = isString ? idx : item[valueKey];
        const label = isString ? item : item[labelKey];

        const disabled = isString
          ? false
          : (disabledKey && item[disabledKey]) ||
            (isOptionDisabled && isOptionDisabled(item));

        return (
          <option
            key={value ?? idx}
            value={value}
            disabled={!!disabled}
          >
            {label}
          </option>
        );
      })}
    </>
  );
};
export function handleSelectWithRule(e, {
  list,
  setForm,
  regra,          // função de domínio
  refEntityKey,   // entidade de refência da função (ex: espécie na troca de espécie da variedade)
  targetEntityKey,// entidade alvo da açao          (ex: variedade na troca de espécie da variedade)
  idKey = "id",   // campo id padrão
}) {
  const selectedId = e.target.value;
  const selectedItem = list.find(i => String(i[idKey]) === String(selectedId));
  if (!selectedItem) throw new Error (`Não foi encontrado ${refEntityKey} com ${idKey} ${selectedId} em ${list}`)

  
  setForm(prev => {
    const novoData = regra({
      [refEntityKey]: selectedItem,
      [targetEntityKey]: prev,   // padrão do seu domínio
    });

    return { ...novoData }; // garante nova referência
  });
};
export const handleSaveForm = async ({evt, onSave, form, transform = null, clearCache = null, onClear, clear=false}) => {
  evt.preventDefault();
  if (clearCache) {
    catalogosService.clearCache(clearCache)
  }
  let data = {...form}
  if (transform) {
      data = transform(data);
    }
  await onSave(data);
  if (clear && onClear) onClear();
}

export const StandardCard = ({header, headerRight, children}) => {
  return(
    <Card className="mb-3">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-start mb-2">
          {header}
          {headerRight}
        </div>
        </Card.Header>
      <Card.Body>
        {children}
      </Card.Body>
    </Card>
  )
}
export const StandardInput = ({label, children, width, unidade, unidadeWidth, info, infoWidth, stacked = false }) => {
  if (stacked) return(
    <Form.Group className="mb-3">
      <InputGroupText className="w-100">{label}</InputGroupText>
      {children}
    </Form.Group>
  )
  if (info)
  return (
    <>
      <InputGroup className="mb-3">
        <InputGroupText style={{width: width || "20%"}}>{label}</InputGroupText>
        {children}
        {unidade && <InputGroupText style={{width: unidadeWidth || "10%"}}>{unidade}</InputGroupText>}
        <InputGroupText style={{
            width: infoWidth || "50%",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}>{info}</InputGroupText>
      </InputGroup>
    </>
  );
  return(
    <InputGroup className="mb-3">
      <InputGroupText style={{width: width || "20%"}}>{label}</InputGroupText>
      {children}
      {unidade && <InputGroupText style={{width: unidadeWidth || "10%"}}>{unidade}</InputGroupText>}
    </InputGroup>
  )
}
export const StandardCheckboxGroup = ({label, cols = 3, gap = "0.75rem", children}) =>{
  return (
    <Form.Group className="mb-3">
      <InputGroupText className="w-100">{label}</InputGroupText>
        <div
          className="mt-2"
          style={{
            marginTop: "-1px",
            padding: "0.75rem",
            border: "1px solid var(--bs-border-color)",
            borderTop: "none",
            borderBottomLeftRadius: ".375rem",
            borderBottomRightRadius: ".375rem",
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap,
          }}
        >
        {children}
      </div>
    </Form.Group>
  )
}
export const StandardBadgeGroup = ({children}) => {
  return (
    <Stack  direction="horizontal" gap={2}>
      {children}
    </Stack>
  )
}
export const StandardArrayInput = ({
  form,
  map,
  header = "Novo item do array",
  headerButton = "Adicionar",
  headerVariant = "success",
  headerData,
  headerDisabled,
  colunas = [],
  acoes = [],
  setForm,
  children}) => {
  const add = () => {
    if (!headerData) return;
    setForm([...(form ?? []), headerData]);
  };
  const remove =  (data, idx) => {
    form.splice(idx, 1)
    setForm(form)
  }
  const moveUp = (data, idx) => {
    if (idx <= 0) return;

    const novoArray = [...form];
    [novoArray[idx - 1], novoArray[idx]] =
      [novoArray[idx], novoArray[idx - 1]];
  
    setForm(novoArray);
  };
  const moveDown = (data, idx) => {
    if (idx >= efeitos.length - 1) return;
  
    const novoArray = [...form];
    [novoArray[idx], novoArray[idx + 1]] =
      [novoArray[idx + 1], novoArray[idx]];
  
    setForm(novoArray);
  };  

  if (!form) return <>Nenhum dado</>
  return (
    <>
      <StandardCard header={header}>
        {children}
        <Button
          variant={`outline-${headerVariant}`}
          disabled = {headerDisabled}
          className="w-100 align-self-end"
          onClick={add}
        >
          {headerButton}
        </Button>
      </StandardCard>
      <ListaAcoes
        dados={map ?? form}
        sort={false}
        colunas={colunas}
        acoes={[...acoes,
          {rotulo: "▲", funcao: moveUp, variant: "outline-warning"},
          {rotulo: "▼", funcao: moveDown, variant: "outline-warning"},
          {rotulo: "Excluir", funcao: remove, variant: "danger"},
        ]}
      />
    </>
  )
}
export const StandardObjectInput = ({object, header, colunas = [], acoes = [], novoItem, onChange, children}) => {
  const update = ({}) => {
    if (!novoItem) return;
    onChange({...(object ?? {}), [novoItem.caracteristicaId]: novoItem});
  };

  const drop = (data) => {
    const { caracteristicaId } = data;

    const novoObjeto = { ...object };
    delete novoObjeto[caracteristicaId];

    onChange(novoObjeto);
  };
  
  return (
    <>
      <InputGroup className="mb-3">
        <InputGroupText>{header}</InputGroupText>
          {children}
          <Button variant="outline-success" className="w-100 align-self-end" onClick={update}>
            Atualizar
          </Button>
      </InputGroup>
      <ListaAcoes
        dados={Object.values(object)}
        colunas={colunas}
        acoes={[...acoes,
          {rotulo: "Excluir", funcao: drop, variant: "danger"},
        ]}
      />
    </>
  )
}
