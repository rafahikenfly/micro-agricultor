export const handleSelectIdNome = (
  e,
  {
    list,
    idKey = "id",
    nomeKey = "nome",
    form,
    setForm,
    fieldId,
    fieldNome,
  }
) => {
  const selectedId = e.target.value;
  const selectedItem = list.find(i => i[idKey] === selectedId);

  setForm({
    ...form,
    [fieldId]: selectedId,
    [fieldNome]: selectedItem ? selectedItem[nomeKey] : "",
  });
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

      {list.map((item) => {
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
