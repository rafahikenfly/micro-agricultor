import { Button, Card, Form, InputGroup, Modal, Row, Stack } from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import ListaComAcoes from "../components/common/ListaComAcoes";
import { VARIANTE } from "micro-agricultor";
import { cacheService } from "../services/cacheService";

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
  list = [],
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

export const optionsFromCacheList = ({
  sourceList = [],          // array base (define a ordem)
  cacheMap,                 // Map(id -> entidade)
  getId,                    // (item) => id a buscar no cache
  mapItem = (e) => ({ id: e.id, nome: e.nome }),
  filterNull = true,
}) => {
  const result = sourceList.map((item) => {
    const id = getId(item);
    const entity = cacheMap?.get(id);
    if (!entity) return null;
    return mapItem(entity, item);
  });

  return filterNull ? result.filter(Boolean) : result;
}
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
    cacheService.clearCache(clearCache)
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
/**
 * Componente padrão para manipulação de arrays em formulários.
 * 
 * Permite adicionar, remover e reordenar itens, além de exibir os dados
 * em uma lista com ações customizáveis.
 *
 * @component
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Array<any>} props.form - Array de dados atual do formulário
 * @param {Array<any>} [props.map] - Array alternativo para exibição (caso necessário mapear os dados)
 * @param {string} [props.header="Novo item do array"] - Texto do cabeçalho do card
 * @param {string} [props.headerButton="Adicionar"] - Texto do botão de adicionar
 * @param {string} [props.headerVariant="success"] - Variante do botão (ex: success, primary, etc.)
 * @param {any} props.headerData - Objeto padrão a ser adicionado ao array ao clicar em "Adicionar"
 * @param {boolean} [props.headerDisabled] - Define se o botão de adicionar está desabilitado
 * @param {Array<Object>} [props.colunas=[]] - Configuração das colunas da lista
 * @param {Array<Object>} [props.acoes=[]] - Ações adicionais da lista
 * @param {Function} props.setForm - Função para atualizar o estado do formulário
 * @param {React.ReactNode} [props.children] - Conteúdo adicional exibido dentro do card
 * 
 * @returns {JSX.Element} Componente renderizado
 * 
 * @example
 * <StandardArrayInput
 *   form={items}
 *   setForm={setItems}
 *   headerData={{ nome: "", valor: 0 }}
 *   colunas={[{ label: "Nome", field: "nome" }]}
 * />
 * 
 * @description
 * Ações padrão incluídas automaticamente:
 * - ▲ Move o item para cima
 * - ▼ Move o item para baixo
 * - Excluir remove o item do array
 * 
 * @warning
 * A função `remove` modifica diretamente o array original usando `splice`,
 * o que pode causar problemas de imutabilidade no React. Idealmente, use uma cópia:
 * 
 * ```javascript
 * const novoArray = form.filter((_, i) => i !== idx);
 * setForm(novoArray);
 * ```
 * 
 * @note
 * A função `moveDown` contém uma possível inconsistência ao usar `efeitos.length`.
 * O correto provavelmente seria `form.length`.
 */
export const StandardArrayInput = ({
  form,
  setForm,
  showInput = true,
  inputLabel = "Novo item do array",
  inputButtonLabel = "Adicionar",
  inputButtonVariant = "success",
  inputData,
  inputButtonIsDisabled,
  colunas = [],
  acoes = [],
  children}) => {

  const add = () => {
    if (!inputData) return;
    setForm([...(form ?? []), inputData]);
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
    if (idx >= form.length - 1) return;
    const novoArray = [...form];
    [novoArray[idx], novoArray[idx + 1]] =
      [novoArray[idx + 1], novoArray[idx]];
    setForm(novoArray);
  };  

  if (!form) return <>Nenhum dado</>
  return (
    <>
      {showInput && <StandardCard header={inputLabel}>
        {children}
        <Button
          variant={`outline-${inputButtonVariant}`}
          disabled = {inputButtonIsDisabled}
          className="w-100 align-self-end"
          onClick={add}
        >
          {inputButtonLabel}
        </Button>
      </StandardCard>}
      <ListaComAcoes
        dados={form}
        sort={false}
        colunas={colunas}
        acoes={showInput ? [...acoes,
          {rotulo: "▲", funcao: moveUp, variant: VARIANTE.GREY.variant},
          {rotulo: "▼", funcao: moveDown, variant: VARIANTE.GREY.variant},
          {rotulo: "🗑️", funcao: remove, variant: VARIANTE.RED.variant},
        ] : []}
      />
    </>
  )
}
export const StandardObjectInput = ({
  form = {},
  setForm,
  showInput = true,
  inputLabel = "Novo item do objeto",
  inputButtonLabel = "Adicionar",
  inputButtonVariant = "success",
  inputData,
  inputKey,
  inputField,
  inputButtonIsDisabled,
  colunas = [],
  acoes = [],
  children}) => {

  const update = ({}) => {
    if (!inputData) return;
    setForm({...form, [inputKey]: inputData});
  };
  const drop = (data, idx) => {
    const key = data[inputField];
    const novoObjeto = {...form};
    delete novoObjeto[key];

    setForm(novoObjeto)
  }
  
  return (
    <>
      {showInput && <StandardCard header={inputLabel}>
        {children}
        <Button
          variant={`outline-${inputButtonVariant}`}
          disabled = {inputButtonIsDisabled}
          className="w-100 align-self-end"
          onClick={update}
        >
          {inputButtonLabel}
        </Button>
      </StandardCard>}
      <ListaComAcoes
        dados={Object.values(form)}
        colunas={colunas}
        acoes={[...acoes,
          {rotulo: "X", funcao: drop, variant: VARIANTE.RED.variant},
        ]}
      />
    </>
  )
}

export const StandardModalFooter = ({onClose, onSave, type = "submit"}) => {
  if (onSave) return (
    <Modal.Footer>
      <Button variant={VARIANTE.GREY.variant} onClick={onClose}>Cancelar</Button>
      <Button variant={VARIANTE.GREEN.variant} type={type} disabled={!onSave}>Salvar</Button>
    </Modal.Footer> 
  )
  return (
    <Modal.Footer>
      <Button variant={VARIANTE.DARKBLUE.variant} onClick={onClose}>Ok</Button>
    </Modal.Footer> 
  )
}
