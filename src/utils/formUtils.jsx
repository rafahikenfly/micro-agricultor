import { Card, Form, InputGroup } from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";

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
  refEntityKey,
  targetEntityKey,
  idKey = "id",   // campo id padrão
}) {
  const selectedId = e.target.value;
  const selectedItem = list.find(i => String(i[idKey]) === String(selectedId));
  if (!selectedItem) throw new Error (`Não foi encontrado ${refEntity} com ${idKey} ${selectedId} em ${list}`)

  
  setForm(prev => {
    const novoData = regra({
      [refEntity]: selectedItem,
      [targetEntity]: prev,   // padrão do seu domínio
    });

    return { ...novoData }; // garante nova referência
  });
};

export const timestampToString = (createdAt) => {
  if (!createdAt) return "";
  return createdAt.toDate().toLocaleString("pt-BR");
};

export const StandardCard = ({header, children}) => {
  return(
    <Card className="mb-3">
      <Card.Header>{header}</Card.Header>
      <Card.Body>
        {children}
      </Card.Body>
    </Card>
  )
}
export const StandardInput = ({label, unidade, children, width, unidadeWidth, stacked = false}) => {
  if (stacked) return(
    <Form.Group className="mb-3">
      <InputGroupText className="w-100">{label}</InputGroupText>
      {children}
    </Form.Group>
  )
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