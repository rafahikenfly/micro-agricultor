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

      {(list || []).map((item) => {
        const disabled =
          (disabledKey && item[disabledKey]) ||
          (isOptionDisabled && isOptionDisabled(item));

        return (
          <option
            key={item[valueKey]}
            value={item[valueKey]}
            disabled={!!disabled}
        >
            {item[labelKey]}
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
